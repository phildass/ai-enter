import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

import { verifyHandoffToken } from '../../../lib/verifyHandoffToken';
import { verifyIiskillsToken } from '../../../lib/verifyIiskillsToken';
import { IISKILLS_ALLOWED_COURSES, IISKILLS_DEFAULT_AMOUNT_PAISE } from '../../../lib/courses';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user_id, app_name, user_email, user_phone, customer_name, session_id, amount_paise, currency, validity_days, return_url, course;

  if (req.body.iiskills_token) {
    // New iiskills JWT flow: token issued by iiskills-cloud, verified with IISKILLS_PAYMENT_TOKEN_SECRET
    let payload;
    try {
      payload = verifyIiskillsToken(req.body.iiskills_token);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid iiskills token' });
    }
    user_id = payload.user_id || null;
    user_phone = payload.phone || payload.user_phone || null;
    customer_name = payload.name || payload.customer_name || null;
    app_name = 'iiskills';
    course = payload.courseSlug;
    amount_paise = payload.amount_paise || payload.amountPaise || IISKILLS_DEFAULT_AMOUNT_PAISE;
    currency = payload.currency || 'INR';
    validity_days = payload.validity_days || 365;
    return_url = payload.return_to || payload.return_url || null;
    session_id = payload.purchaseId;
  } else if (req.body.session_token) {
    // Token-based flow (jai-bharat, jai-kisan)
    let payload;
    try {
      payload = verifyHandoffToken(req.body.session_token);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid session token' });
    }
    user_id = payload.user_id;
    app_name = payload.app_name;
    user_email = payload.user_email || '';
    user_phone = payload.user_phone;
    session_id = payload.session_id;
    amount_paise = payload.amount_paise;
    currency = payload.currency;
    validity_days = payload.validity_days;
    return_url = payload.return_url;
    // course passed alongside token (course selected on the payment page)
    if (req.body.course !== undefined) {
      course = req.body.course;
      if (course && typeof course !== 'string') {
        return res.status(400).json({ error: 'Invalid course value' });
      }
      if (course && !IISKILLS_ALLOWED_COURSES.includes(course)) {
        return res.status(400).json({ error: 'Invalid course. Must be one of: ' + IISKILLS_ALLOWED_COURSES.join(', ') });
      }
    }
  } else {
    // Legacy flow (direct API callers)
    ({ user_id, app_name, user_email, user_phone, customer_name, course } = req.body);
    if (course && typeof course !== 'string') {
      return res.status(400).json({ error: 'Invalid course value' });
    }
    if (course && !IISKILLS_ALLOWED_COURSES.includes(course)) {
      return res.status(400).json({ error: 'Invalid course. Must be one of: ' + IISKILLS_ALLOWED_COURSES.join(', ') });
    }
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  try {
    // Idempotency check: when Supabase is configured and we have both app_name and
    // session_id, look up the most-recent transaction for this purchase attempt.
    //   • status = 'paid'    → this purchase link was already used; block with 409.
    //   • status = 'pending' and razorpay_order_id exists → reuse that order so the
    //     client retries the same Razorpay order instead of creating duplicates.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey && app_name && session_id) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data: existing, error: lookupError } = await supabase
        .from('payment_transactions')
        .select('id, status, razorpay_order_id, amount, currency, return_url')
        .eq('app_name', app_name)
        .eq('session_id', session_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lookupError) {
        // Non-fatal: log and continue to create a fresh order.
        console.error('[create-order] Supabase lookup failed (non-fatal):', lookupError.message);
      } else if (existing) {
        if (existing.status === 'paid' || existing.status === 'success') {
          // This purchase/session was already paid — prevent reuse.
          console.warn(`[create-order] Attempt to reuse paid session: app=${app_name} session=${session_id}`);
          return res.status(409).json({
            error: 'This payment link has already been used. Please start a new purchase.',
            reused: false,
          });
        }

        if (existing.status === 'pending' && existing.razorpay_order_id) {
          // Return the existing pending Razorpay order so the client can retry.
          console.log(`[create-order] Reusing pending order ${existing.razorpay_order_id} for session=${session_id}`);
          return res.status(200).json({
            orderId: existing.razorpay_order_id,
            // existing.amount is stored in INR; convert back to paise for the client.
            // Fall back to the request's amount_paise, then the default paise constant.
            amount: Math.round((existing.amount || (amount_paise || IISKILLS_DEFAULT_AMOUNT_PAISE) / 100) * 100),
            currency: existing.currency || currency || 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
            session_id,
            return_url: existing.return_url || return_url || null,
            reused: true,
          });
        }
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount_paise || 11682,
      currency: currency || 'INR',
      receipt: `${app_name}_${session_id || Date.now()}`.slice(0, 40),
      notes: {
        user_id,
        app_name,
        session_id,
        user_email: user_email || '',
        user_phone: user_phone || '',
        customer_name: customer_name || '',
        course: course || undefined,
      },
    });

    // Save transaction to Supabase if configured
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user_id || null,
          user_email: user_email || null,
          user_phone: user_phone || null,
          customer_name: customer_name || null,
          app_name,
          session_id,
          razorpay_order_id: order.id,
          amount: (amount_paise || 11682) / 100,
          currency: currency || 'INR',
          validity_days: validity_days || 30,
          return_url: return_url || null,
          course: course || null,
          status: 'pending',
        });

      if (error) {
        // Non-fatal: payment_transactions table may not exist yet, or a column may
        // differ from the schema.  The Razorpay order is already created so we
        // continue and return a successful response to the client.
        console.error('[create-order] Supabase insert into payment_transactions failed (non-fatal):', error.message);
      }
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      session_id,
      return_url: return_url || null,
      reused: false,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Unable to process payment. Please try again.' });
  }
}
