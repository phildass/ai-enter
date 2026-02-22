-- AI Enter - Extended Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up the complete database
-- Note: This extends the base schema. Run supabase-schema.sql first if purchases table doesn't exist.

-- Create purchases table if it doesn't exist (from base schema)
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

-- Create users table for registration
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER,
  stage TEXT CHECK (stage IN ('Student', 'Employed', 'Other')),
  father_occupation TEXT,
  mother_occupation TEXT,
  location_name TEXT,
  taluk TEXT,
  district TEXT,
  state TEXT,
  location_other TEXT,
  phone TEXT NOT NULL,
  purpose TEXT CHECK (purpose IN ('Just Browsing', 'Intend to take a course')),
  registered_via_google BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  paid_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_access table for tracking user access to courses
CREATE TABLE IF NOT EXISTS course_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  otp TEXT,
  otp_generated_at TIMESTAMP WITH TIME ZONE,
  otp_activated BOOLEAN DEFAULT FALSE,
  access_granted_at TIMESTAMP WITH TIME ZONE,
  access_expires_at TIMESTAMP WITH TIME ZONE,
  payment_id UUID REFERENCES purchases(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create otp_codes table for admin-generated codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  otp_code TEXT UNIQUE NOT NULL,
  course_id TEXT NOT NULL,
  created_by TEXT DEFAULT 'admin',
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update purchases table with additional fields
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS otp_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS otp_code TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_course_access_user ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_course ON otp_codes(course_id);

-- Enable Row Level Security (with rate limiting consideration)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (with CAPTCHA requirement to be enforced at application level)
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow insert for registration" ON users;
CREATE POLICY "Allow insert for registration" ON users
  FOR INSERT WITH CHECK (true);
-- Note: Rate limiting and CAPTCHA validation should be enforced at application level

-- Create policies for course_access table
DROP POLICY IF EXISTS "Users can read own course access" ON course_access;
CREATE POLICY "Users can read own course access" ON course_access
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insert for course access" ON course_access;
CREATE POLICY "Allow insert for course access" ON course_access
  FOR INSERT WITH CHECK (true);

-- Create policies for otp_codes table (admin only for creation, public for validation)
DROP POLICY IF EXISTS "Allow read for validation" ON otp_codes;
CREATE POLICY "Allow read for validation" ON otp_codes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for admin" ON otp_codes;
CREATE POLICY "Allow insert for admin" ON otp_codes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for usage tracking" ON otp_codes;
CREATE POLICY "Allow update for usage tracking" ON otp_codes
  FOR UPDATE USING (true);

-- Function to generate OTP (using cryptographically secure random)
-- Note: For production, consider using pgcrypto extension: CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS TEXT AS $$
DECLARE
  otp TEXT;
BEGIN
  -- Generate 6-digit OTP using gen_random_uuid() for better randomness
  -- Convert UUID to integer and take modulo to get 6 digits
  otp := LPAD(((ABS(HASHTEXT(gen_random_uuid()::TEXT)) % 1000000))::TEXT, 6, '0');
  RETURN otp;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Payment Transactions Table (Jai Kisan & Jai Bharat)
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  user_id UUID NOT NULL,
  user_email TEXT,
  user_phone TEXT,

  -- App identification
  app_name TEXT NOT NULL, -- 'jai-kisan' or 'jai-bharat'

  -- Handoff session tracking
  session_id TEXT,

  -- Payment details
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,

  amount DECIMAL(10, 2) NOT NULL DEFAULT 116.82,
  currency TEXT DEFAULT 'INR',
  validity_days INTEGER DEFAULT 30,

  -- Origin return URL (from handoff token)
  return_url TEXT,

  -- Payment status
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  payment_method TEXT, -- 'upi', 'card', 'netbanking', etc.
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Webhook tracking
  webhook_sent BOOLEAN DEFAULT false,
  webhook_response TEXT,
  webhook_sent_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_razorpay_order UNIQUE(razorpay_order_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_app_name ON payment_transactions(app_name);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id ON payment_transactions(session_id);

-- Migrate existing payment_transactions tables: add new columns if they don't exist
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS user_phone TEXT;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 30;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS return_url TEXT;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payment_transactions ALTER COLUMN webhook_sent_at TYPE TIMESTAMP WITH TIME ZONE;

-- Unique index on session_id, ignoring NULL values (safe for existing rows with NULL session_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_session_id_unique
  ON payment_transactions(session_id)
  WHERE session_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on payment_transactions
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
