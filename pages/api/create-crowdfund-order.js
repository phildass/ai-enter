import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amountInr, name, phone } = req.body;

    // Server-side validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!trimmedName || trimmedName.length > 200) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    if (!trimmedPhone || !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number (must be 10-digit Indian mobile)' });
    }

    const amount = Number(amountInr);
    if (!amountInr || isNaN(amount) || amount < 100) {
      return res.status(400).json({ error: 'Minimum amount is ₹100' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Payment system not configured. Please contact administrator.' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `crowdfund_${Date.now()}`,
      notes: {
        type: 'crowdfund',
        name: trimmedName,
        phone: trimmedPhone,
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating crowdfund order:', error);
    return res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
}
