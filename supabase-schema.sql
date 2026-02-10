-- AI Enter - Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up the database

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  course_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_purchases_phone ON purchases(customer_phone);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON purchases(created_at DESC);

-- Enable Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for payment recording)
DROP POLICY IF EXISTS "Allow insert for all" ON purchases;
CREATE POLICY "Allow insert for all" ON purchases
  FOR INSERT WITH CHECK (true);

-- Create policy to allow reads (for admin access)
DROP POLICY IF EXISTS "Allow read for all" ON purchases;
CREATE POLICY "Allow read for all" ON purchases
  FOR SELECT USING (true);

-- Sample queries for admin use:

-- View all purchases
-- SELECT * FROM purchases ORDER BY created_at DESC;

-- View purchases by phone number
-- SELECT * FROM purchases WHERE customer_phone = '1234567890';

-- View purchases for a specific course
-- SELECT * FROM purchases WHERE course_id = 'ai-ml-fundamentals';

-- Count purchases per course
-- SELECT course_id, COUNT(*) as total_purchases 
-- FROM purchases 
-- GROUP BY course_id;

-- Revenue by course (prices from lib/courses.js)
-- SELECT 
--   course_id,
--   COUNT(*) as total_sales,
--   CASE course_id
--     WHEN 'ai-ml-fundamentals' THEN COUNT(*) * 4999
--     WHEN 'cloud-essentials' THEN COUNT(*) * 5999
--     WHEN 'fullstack-dev' THEN COUNT(*) * 7999
--     WHEN 'data-science' THEN COUNT(*) * 6499
--   END as revenue_inr
-- FROM purchases
-- WHERE payment_status = 'completed'
-- GROUP BY course_id;
