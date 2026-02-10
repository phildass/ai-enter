import Razorpay from 'razorpay';
import { getCourseById, getCurrentFee } from '../../lib/courses';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { courseId, customerName, customerPhone } = req.body;

    // Validate inputs
    if (!courseId || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const course = getCourseById(courseId);
    if (!course) {
      return res.status(400).json({ error: 'Invalid course' });
    }

    // Check if Razorpay credentials are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        error: 'Payment system not configured. Please contact administrator.' 
      });
    }

    // Get current fee (same for all courses)
    const feeInfo = getCurrentFee();

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Create order
    const options = {
      amount: feeInfo.total, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: courseId,
        courseName: course.name,
        customerName: customerName,
        customerPhone: customerPhone,
        basePrice: feeInfo.displayBase,
        gst: feeInfo.displayGst,
        total: feeInfo.displayTotal
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      feeInfo: feeInfo
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message 
    });
  }
}
