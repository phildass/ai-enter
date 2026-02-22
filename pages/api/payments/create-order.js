import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { verifyHandoffToken } from '../../../lib/verifyHandoffToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let user_id, app_name, user_email;

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
  } else {
    // Legacy flow (iiskills and direct API callers)
    ({ user_id, app_name, user_email } = req.body);
  }

  if (!user_id || !app_name) {
    return res.status(400).json({ error: 'user_id and app_name are required' });
  }

  if (!['iiskills', 'jai-kisan', 'jai-bharat'].includes(app_name)) {
    return res.status(400).json({ error: 'Invalid app_name' });
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
      amount: 11682, // ₹116.82 in paise
      currency: 'INR',
      receipt: `${app_name}_${user_id}_${Date.now()}`,
      notes: {
        user_id,
        app_name,
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
          app_name,
          razorpay_order_id: order.id,
          amount: 116.82,
          currency: 'INR',
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
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
