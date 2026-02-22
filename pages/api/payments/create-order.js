import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { verifyHandoffToken } from '../../../lib/handoff';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Signed handoff token is required' });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  let payload;
  try {
    payload = verifyHandoffToken(token);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const {
    app_name,
    user_id,
    user_email,
    user_phone,
    session_id,
    amount_paise,
    currency,
    validity_days,
    return_url,
  } = payload;

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount_paise || 11682,
      currency: currency || 'INR',
      receipt: `${app_name}_${session_id}`,
      notes: {
        user_id,
        app_name,
        session_id,
        user_email: user_email || '',
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
          user_id,
          user_email: user_email || null,
          user_phone: user_phone || null,
          app_name,
          session_id,
          razorpay_order_id: order.id,
          amount: (amount_paise || 11682) / 100,
          currency: currency || 'INR',
          validity_days: validity_days || 30,
          return_url: return_url || null,
          status: 'pending',
        });

      if (error) {
        console.error('Supabase insert error:', error);
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
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
