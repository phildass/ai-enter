import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    user_id,
    app_name,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  try {
    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch payment method from Razorpay
    let paymentMethod = null;
    if (process.env.RAZORPAY_KEY_ID) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        paymentMethod = payment.method;
      } catch (err) {
        console.error('Failed to fetch payment details:', err);
      }
    }

    // Update transaction in Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let transactionId = null;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'success',
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
      } else {
        transactionId = transaction?.id;

        // Send webhook to respective app backend
        const webhookUrl =
          app_name === 'jai-kisan'
            ? process.env.JAI_KISAN_WEBHOOK_URL
            : process.env.JAI_BHARAT_WEBHOOK_URL;

        if (webhookUrl) {
          try {
            const webhookRes = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id,
                transaction_id: razorpay_payment_id,
                amount: 116.82,
                payment_method: paymentMethod,
                status: 'success',
                signature: razorpay_signature,
              }),
            });
            const webhookData = await webhookRes.json().catch(() => ({}));

            await supabase
              .from('payment_transactions')
              .update({
                webhook_sent: true,
                webhook_response: JSON.stringify(webhookData),
                webhook_sent_at: new Date().toISOString(),
              })
              .eq('id', transactionId);
          } catch (webhookError) {
            console.error('Webhook error:', webhookError);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      transactionId,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}
