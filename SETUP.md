# AI Enter - Course Payment Platform

A Next.js-based platform for selling online courses with integrated Razorpay payment gateway and Supabase database for tracking purchases.

## Features

- 📚 Display static course pages from `/public`
- 💳 Secure payment processing with Razorpay
- 📊 Purchase tracking in Supabase database
- 🎯 User-friendly payment flow with name and phone verification
- ✅ Payment verification and confirmation
- 📱 Responsive design

## Prerequisites

- Node.js 18+ installed
- Razorpay account (get your API keys from [Razorpay Dashboard](https://dashboard.razorpay.com/))
- Supabase account (get your project URL and keys from [Supabase Dashboard](https://app.supabase.com/))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/phildass/ai-enter.git
cd ai-enter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Razorpay Configuration

1. Sign up at [Razorpay](https://razorpay.com/) and complete KYC
2. Go to Settings > API Keys in the Razorpay Dashboard
3. Generate API keys (you'll get a Key ID and Key Secret)
4. For testing, use Test Mode keys
5. For production, activate your account and use Live Mode keys

**Important Security Notes:**
- Never commit your `.env` file to Git
- Never expose your `RAZORPAY_KEY_SECRET` in client-side code
- The secret key is only used in API routes on the server

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Note your project URL and anon key from Settings > API

### 2. Create the Purchases Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Create purchases table
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  course_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_purchases_phone ON purchases(customer_phone);
CREATE INDEX idx_purchases_course ON purchases(course_id);
CREATE INDEX idx_purchases_created ON purchases(created_at DESC);

-- Enable Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for payment recording)
CREATE POLICY "Allow insert for all" ON purchases
  FOR INSERT WITH CHECK (true);

-- Create policy to allow reads (for admin access)
CREATE POLICY "Allow read for all" ON purchases
  FOR SELECT USING (true);
```

### 3. Access Purchase Records

You can query purchases in Supabase:

```sql
-- View all purchases
SELECT * FROM purchases ORDER BY created_at DESC;

-- View purchases by phone number
SELECT * FROM purchases WHERE customer_phone = '1234567890';

-- View purchases for a specific course
SELECT * FROM purchases WHERE course_id = 'ai-ml-fundamentals';

-- Count purchases per course
SELECT course_id, COUNT(*) as total_purchases 
FROM purchases 
GROUP BY course_id;
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
ai-enter/
├── pages/
│   ├── api/
│   │   ├── create-order.js    # Creates Razorpay orders
│   │   └── verify-payment.js  # Verifies payments and saves to Supabase
│   ├── index.js               # Redirects to static home page
│   ├── payments.js            # Payment form page
│   └── success.js             # Payment success page
├── public/
│   ├── index.html            # Static home page
│   └── courses.html          # Static courses page
├── lib/
│   ├── courses.js            # Course data and utilities
│   └── supabase.js           # Supabase client configuration
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Available Courses

The platform includes 4 sample courses:

1. **AI & Machine Learning Fundamentals** - ₹4,999
2. **Cloud Computing Essentials** - ₹5,999
3. **Full Stack Development** - ₹7,999
4. **Data Science & Analytics** - ₹6,499

Edit `lib/courses.js` to add or modify courses.

## Payment Flow

1. User visits `/payments` or clicks "Enroll Now" on a course
2. User enters name, phone number, and selects a course
3. Backend creates a Razorpay order via `/api/create-order`
4. Razorpay payment modal opens for user to complete payment
5. After payment, signature is verified via `/api/verify-payment`
6. Purchase record is saved to Supabase
7. User is redirected to success page

## Security Features

✅ Payment secrets never exposed to client  
✅ Server-side signature verification  
✅ Environment variables for sensitive data  
✅ HTTPS required for production  
✅ Row Level Security enabled in Supabase  

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel project settings
4. Deploy!

### Other Platforms

The app can be deployed to any Node.js hosting platform:
- Netlify
- AWS (Amplify, EC2, ECS)
- Google Cloud
- Azure
- DigitalOcean

Make sure to:
1. Set all environment variables
2. Use production Razorpay keys for live payments
3. Enable HTTPS

## Admin Access

To view all purchases and manage user access:

1. Log into your Supabase dashboard
2. Go to Table Editor > purchases
3. View all transaction records
4. Export data as CSV if needed

You can also create custom SQL queries or build an admin dashboard using the Supabase API.

## Testing

### Test Payment Flow

1. Use Razorpay Test Mode keys
2. Use test card numbers from [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
3. Example test card: 4111 1111 1111 1111, any future date, any CVV

### Verify Database Records

After a test payment, check Supabase to ensure the purchase was recorded.

## Troubleshooting

### Payment Modal Doesn't Open

- Check browser console for errors
- Verify Razorpay script is loading
- Ensure `RAZORPAY_KEY_ID` is set correctly

### Payment Verification Fails

- Check `RAZORPAY_KEY_SECRET` is correct
- Verify signature generation logic
- Check API route logs

### Supabase Insert Fails

- Verify Supabase credentials
- Check table exists and has correct schema
- Review Row Level Security policies

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Razorpay documentation](https://razorpay.com/docs/)
- Check [Supabase documentation](https://supabase.com/docs)

## License

ISC
