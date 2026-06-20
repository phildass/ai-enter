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
} from '../../../lib/razorpayPaymentLink';

/** Hosted payment page — avoids checkout.js modal UPI cancel/dismiss bugs on mobile. */
function usesHostedPaymentLink(appName) {
  return appName === 'iiskills';
}

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
    let payload;
    try {
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
    session_id = payload.purchaseId;
    handoff_token = req.body.iiskills_token;
  } else if (req.body.session_token) {
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

    const hostedLink = usesHostedPaymentLink(app_name);

    if (hostedLink && !user_phone) {
      return res.status(400).json({
        error: 'Valid 10-digit mobile number is required for UPI payment.',
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
        const row = existing[0];

        if (row.status === 'success' || row.status === 'paid') {
          return res.status(409).json({
            error: 'This payment link has already been used. Please start a new purchase.',
          });
        }

        if (hostedLink) {
          // Never reuse Razorpay orders for iiskills — each Pay gets a fresh hosted link.
          if (row.status === 'pending') {
            try {
              const existingOrder = await razorpay.orders.fetch(row.razorpay_order_id);
              if (existingOrder.status === 'paid') {
                await supabase
                  .from('payment_transactions')
                  .update({ status: 'success', updated_at: new Date().toISOString() })
                  .eq('id', row.id);
                return res.status(409).json({
                  error: 'This payment link has already been used. Please start a new purchase.',
                });
              }
            } catch (fetchErr) {
              console.error('[create-order] stale order fetch failed:', fetchErr.message);
            }

            await supabase
              .from('payment_transactions')
              .update({ status: 'failed', updated_at: new Date().toISOString() })
              .eq('id', row.id);
          }
        } else if (row.status === 'failed' || freshOrder) {
          // create a new Razorpay order below
        } else if (row.status === 'pending' && row.razorpay_order_id) {
          try {
            const existingOrder = await razorpay.orders.fetch(row.razorpay_order_id);

            if (existingOrder.status === 'paid') {
              await supabase
                .from('payment_transactions')
                .update({ status: 'success', updated_at: new Date().toISOString() })
                .eq('id', row.id);
              return res.status(409).json({
                error: 'This payment link has already been used. Please start a new purchase.',
              });
            }

            if (existingOrder.status === 'created') {
              if (handoff_token) {
                await supabase
                  .from('payment_transactions')
                  .update({ handoff_token, updated_at: new Date().toISOString() })
                  .eq('id', row.id);
              }
              return res.status(200).json({
                orderId: existingOrder.id,
                amount: existingOrder.amount,
                currency: existingOrder.currency || currency || 'INR',
                keyId: publicKey,
                session_id,
                return_url: row.return_url || return_url || null,
                reused: true,
              });
            }

            console.log(
              `[create-order] Replacing attempted Razorpay order ${row.razorpay_order_id} for session ${session_id}`,
            );
            await supabase
              .from('payment_transactions')
              .update({ status: 'failed', updated_at: new Date().toISOString() })
              .eq('id', row.id);
          } catch (fetchErr) {
            console.error(
              '[create-order] Failed to fetch existing Razorpay order (creating fresh):',
              fetchErr.message,
            );
            await supabase
              .from('payment_transactions')
              .update({ status: 'failed', updated_at: new Date().toISOString() })
              .eq('id', row.id);
          }
        }
      }
    }

    const finalAmountPaise = amount_paise || 11682;
    const finalCurrency = currency || 'INR';

    if (hostedLink) {
      const description =
        course === 'all-courses-bundle'
          ? 'iiskills — All Courses (5 for 1 till June 30, 2026)'
          : `iiskills — ${course || 'course'} access`;

      const linkResult = await createPaymentLinkForOrder(razorpay, {
        referenceId: session_id,
        amountPaise: finalAmountPaise,
        currency: finalCurrency,
        description,
        customerName: customer_name || 'Customer',
        customerPhone: user_phone,
        customerEmail: user_email,
        appName: app_name,
      });

      if (supabase) {
        const { error } = await supabase.from('payment_transactions').insert({
          user_id: user_id || null,
          user_email: user_email || null,
          user_phone: user_phone || null,
          customer_name: customer_name || null,
          app_name,
          session_id,
          razorpay_order_id: linkResult.orderId,
          amount: finalAmountPaise / 100,
          currency: finalCurrency,
          validity_days: validity_days || 30,
          return_url: return_url || null,
          course: course || null,
          handoff_token: handoff_token || null,
          status: 'pending',
        });

        if (error) {
          console.error('[create-order] Supabase insert failed (non-fatal):', error.message);
        }
      }

      return res.status(200).json({
        orderId: linkResult.orderId,
        checkoutUrl: linkResult.checkoutUrl,
        amount: finalAmountPaise,
        currency: finalCurrency,
        keyId: publicKey,
        session_id,
        return_url: return_url || null,
        paymentFlow: 'redirect',
        reused: false,
      });
    }

    const receiptSuffix = Date.now().toString(36);

    const order = await razorpay.orders.create({
      amount: finalAmountPaise,
      currency: finalCurrency,
      receipt: `${app_name}_${session_id || 'anon'}_${receiptSuffix}`.slice(0, 40),
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

    if (supabase) {
      const { error } = await supabase.from('payment_transactions').insert({
        user_id: user_id || null,
        user_email: user_email || null,
        user_phone: user_phone || null,
        customer_name: customer_name || null,
        app_name,
        session_id,
        razorpay_order_id: order.id,
        amount: finalAmountPaise / 100,
        currency: finalCurrency,
        validity_days: validity_days || 30,
        return_url: return_url || null,
        course: course || null,
        handoff_token: handoff_token || null,
        status: 'pending',
      });

      if (error) {
        console.error(
          '[create-order] Supabase insert into payment_transactions failed (non-fatal):',
          error.message,
        );
      }
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: publicKey,
      session_id,
      return_url: return_url || null,
      reused: false,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: formatRazorpayError(error) });
  }
}
