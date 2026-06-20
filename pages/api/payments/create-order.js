import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

import { verifyHandoffToken } from '../../../lib/verifyHandoffToken';
import { verifyIiskillsToken } from '../../../lib/verifyIiskillsToken';
import { IISKILLS_ALLOWED_COURSES, IISKILLS_DEFAULT_AMOUNT_PAISE } from '../../../lib/courses';
import { resolveIiskillsCourseSlug } from '../../../lib/iiskillsOffer';
import { getRazorpayCredentialsForApp, isSupportedPaymentApp } from '../../../lib/payments';
import {
  createPaymentLinkForOrder,
  extractCustomerPhone,
  formatRazorpayError,
  normalizeIndianPhone,
} from '../../../lib/razorpayPaymentLink';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user_id,
    app_name,
    user_email,
    user_phone,
    customer_name,
    session_id,
    handoff_token,
    amount_paise,
    currency,
    validity_days,
    return_url,
    course;

  if (req.body.iiskills_token) {
    // New iiskills JWT flow: token issued by iiskills, verified with IISKILLS_PAYMENT_TOKEN_SECRET
    let payload;
    try {
      // IMPORTANT: token may omit purchaseId; accept it from request body (from query string)
      payload = verifyIiskillsToken(req.body.iiskills_token, {
        expectedPurchaseId: req.body.purchaseId,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid iiskills token' });
    }

    user_id = payload.user_id || null;
    user_phone =
      extractCustomerPhone({ customer_phone: req.body.customer_phone }) ||
      extractCustomerPhone(payload) ||
      null;
    customer_name = payload.name || payload.customer_name || null;
    user_email = payload.user_email || payload.email || null;
    app_name = 'iiskills';
    course = resolveIiskillsCourseSlug(req.body.course || payload.courseSlug);

    if (!IISKILLS_ALLOWED_COURSES.includes(course)) {
      return res.status(400).json({ error: `Invalid course in token: ${course}` });
    }

    amount_paise = payload.amount_paise || payload.amountPaise || IISKILLS_DEFAULT_AMOUNT_PAISE;
    currency = payload.currency || 'INR';
    validity_days = payload.validity_days || 365;
    return_url = payload.return_to || payload.return_url || null;

    // For iiskills, session_id == purchaseId
    session_id = payload.purchaseId;
    handoff_token = req.body.iiskills_token;
  } else if (req.body.session_token) {
    // Token-based flow (jai-bharat, jai-kisan, iisacademy)
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
    customer_name = payload.customer_name || '';
    session_id = payload.session_id;
    handoff_token = req.body.session_token;
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
        return res
          .status(400)
          .json({ error: 'Invalid course. Must be one of: ' + IISKILLS_ALLOWED_COURSES.join(', ') });
      }
    }
  } else {
    // Legacy flow (direct API callers)
    ({ user_id, app_name, user_email, user_phone, customer_name, course } = req.body);
    if (course && typeof course !== 'string') {
      return res.status(400).json({ error: 'Invalid course value' });
    }
    if (course && !IISKILLS_ALLOWED_COURSES.includes(course)) {
      return res.status(400).json({
        error: 'Invalid course. Must be one of: ' + IISKILLS_ALLOWED_COURSES.join(', '),
      });
    }
  }

  // Supabase (optional but enables idempotency + "already paid" protection)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

  try {
    if (!isSupportedPaymentApp(app_name)) {
      return res.status(400).json({
        error: 'Unsupported payment app. Only iiskills and uriq.in are allowed.',
      });
    }

    if (app_name === 'iiskills' && !normalizeIndianPhone(user_phone)) {
      return res.status(400).json({
        error:
          'Enter the 10-digit mobile number of the UPI app you will pay with (GPay, PhonePe, etc.).',
      });
    }

    const { keyId, keySecret, publicKey } = getRazorpayCredentialsForApp(app_name);
    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: `Payment system not configured for ${app_name}`,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const freshOrder = Boolean(req.body.fresh_order);
    const finalAmountPaise = amount_paise || 11682;
    const finalCurrency = currency || 'INR';
    const paymentDescription =
      app_name === 'iiskills'
        ? 'IIS Skills — 1-Year Access (₹116.82 incl. GST)'
        : `${app_name} course payment`;

    async function buildCheckoutPayload() {
      const link = await createPaymentLinkForOrder(razorpay, {
        referenceId: session_id,
        amountPaise: finalAmountPaise,
        currency: finalCurrency,
        description: paymentDescription,
        customerName: customer_name,
        customerPhone: user_phone,
        customerEmail: user_email,
        appName: app_name,
      });

      return {
        orderId: link.orderId,
        amount: finalAmountPaise,
        currency: finalCurrency,
        keyId: publicKey,
        session_id,
        return_url: return_url || null,
        checkoutUrl: link.checkoutUrl,
        paymentLinkId: link.paymentLinkId,
      };
    }

    // --- Idempotency / reuse protection (requires Supabase configured) ---
    let existingRow = null;
    if (supabase && app_name && session_id) {
      const { data: existing, error: existingErr } = await supabase
        .from('payment_transactions')
        .select('id, razorpay_order_id, status, amount, currency, return_url')
        .eq('app_name', app_name)
        .eq('session_id', session_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingErr) {
        console.error('[create-order] Supabase lookup failed (non-fatal):', existingErr.message);
      } else if (existing?.length > 0) {
        existingRow = existing[0];

        if (existingRow.status === 'success' || existingRow.status === 'paid') {
          return res.status(409).json({
            error: 'This payment link has already been used. Please start a new purchase.',
          });
        }

        if (existingRow.razorpay_order_id && existingRow.status === 'pending' && !freshOrder) {
          try {
            const existingOrder = await razorpay.orders.fetch(existingRow.razorpay_order_id);
            if (existingOrder.status === 'paid') {
              await supabase
                .from('payment_transactions')
                .update({ status: 'success', updated_at: new Date().toISOString() })
                .eq('id', existingRow.id);
              return res.status(409).json({
                error: 'This payment link has already been used. Please start a new purchase.',
              });
            }
          } catch (fetchErr) {
            console.error(
              '[create-order] Failed to fetch existing Razorpay order (creating fresh link):',
              fetchErr.message,
            );
          }
        }
      }
    }

    const payload = await buildCheckoutPayload();

    if (supabase) {
      const rowData = {
        user_id: user_id || null,
        user_email: user_email || null,
        user_phone: user_phone || null,
        customer_name: customer_name || null,
        app_name,
        session_id,
        razorpay_order_id: payload.orderId,
        amount: finalAmountPaise / 100,
        currency: finalCurrency,
        validity_days: validity_days || 30,
        return_url: return_url || null,
        course: course || null,
        handoff_token: handoff_token || null,
        status: 'pending',
        updated_at: new Date().toISOString(),
      };

      if (existingRow && existingRow.status !== 'success' && existingRow.status !== 'paid') {
        const { error } = await supabase
          .from('payment_transactions')
          .update(rowData)
          .eq('id', existingRow.id);

        if (error) {
          console.error('[create-order] Supabase update failed (non-fatal):', error.message);
        }
      } else {
        const { error } = await supabase.from('payment_transactions').insert(rowData);

        if (error) {
          console.error(
            '[create-order] Supabase insert into payment_transactions failed (non-fatal):',
            error.message,
          );
        }
      }
    }

    return res.status(200).json({
      ...payload,
      reused: false,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    const message = formatRazorpayError(error);
    const status =
      error.message?.includes('required for UPI') ||
      error.message?.includes('Valid 10-digit')
        ? 400
        : 502;
    return res.status(status).json({ error: message });
  }
}