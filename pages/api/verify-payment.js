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
      courseId,
      customerName,
      customerPhone
    } = req.body;

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    // Payment is verified, now save to Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .insert([
            {
              customer_name: customerName,
              customer_phone: customerPhone,
              course_id: courseId,
              razorpay_order_id: razorpay_order_id,
              razorpay_payment_id: razorpay_payment_id,
              payment_status: 'completed',
              created_at: new Date().toISOString()
            }
          ]);

        if (error) {
          console.error('Supabase error:', error);
          // Still return success as payment was verified
          // But log the database error
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Payment is still valid, so we return success
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Payment verified successfully' 
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment', 
      details: error.message 
    });
  }
}
