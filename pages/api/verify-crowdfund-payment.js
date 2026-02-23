import crypto from 'crypto';
import supabase from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amountInr,
      name,
      phone,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ ok: false, error: 'Invalid payment signature' });
    }

    // Store in Supabase
    if (supabase) {
      try {
        const { error: dbError } = await supabase.from('crowdfund_payments').insert([
          {
            customer_name: String(name || '').trim(),
            customer_phone: String(phone || '').trim(),
            amount_inr: Number(amountInr),
            razorpay_order_id,
            razorpay_payment_id,
            payment_status: 'completed',
          },
        ]);

        if (dbError) {
          console.error('Supabase error:', dbError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error verifying crowdfund payment:', error);
    return res.status(500).json({ ok: false, error: 'Failed to verify payment', details: error.message });
  }
}
