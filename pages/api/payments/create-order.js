import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

import { verifyHandoffToken } from '../../../lib/verifyHandoffToken';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user_id, app_name, user_email, user_phone, customer_name, session_id, amount_paise, currency, validity_days, return_url, course;

  if (req.body.session_token) {
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
  } else {
    // Legacy flow (iiskills and direct API callers)
    ({ user_id, app_name, user_email, user_phone, customer_name, course } = req.body);
    if (course && typeof course !== 'string') {
      return res.status(400).json({ error: 'Invalid course value' });
    }
    const ALLOWED_COURSES = ['learn-ai', 'learn-developer', 'learn-pr', 'learn-management'];
    if (course && !ALLOWED_COURSES.includes(course)) {
      return res.status(400).json({ error: 'Invalid course. Must be one of: ' + ALLOWED_COURSES.join(', ') });
    }
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  try {
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Unable to process payment. Please try again.' });
  }
}
