# AI Cloud Enterprises

Modern, elegant platform for AI and cloud technology education with integrated course enrollment and payments.

## Overview

This is a Next.js-based platform offering premium courses in AI, Machine Learning, Cloud Computing, Full Stack Development, and Data Science. Features a modern, elegant design with integrated Razorpay payment gateway and Supabase database for tracking enrollments.

## Features

- 🎨 Modern, elegant UI with hero sections and responsive design
- 🏠 Complete site with Home, About, Contact, Enroll, and Payment pages
- 📚 Unified pricing for all courses (Early Bird: ₹116.82, Regular: ₹352.82)
- 💳 Secure payment processing with Razorpay
- 📊 Enrollment tracking in Supabase database
- 🎯 Streamlined enrollment and payment flow
- ✅ Server-side payment verification
- 📱 Fully responsive design
- 🖼️ Dynamic image integration from public assets

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Razorpay and Supabase credentials.

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Site Structure

- **Home (/)** - Hero section with AI Cloud logo, feature highlights, and stats
- **About (/about)** - Mission, approach, and core values
- **Contact (/contact)** - Contact information and message form
- **Enroll (/enroll)** - Course catalog with unified pricing
- **Payment (/payment)** - Secure payment form with Razorpay integration
- **Success (/success)** - Enrollment confirmation page

## Pricing

All courses have the same fee structure:

- **Early Bird (Till Feb 28, 2026):** ₹99 + 18% GST = ₹116.82
- **Regular (From March 1, 2026):** ₹299 + 18% GST = ₹352.82

## Available Courses

1. AI & Machine Learning Fundamentals
2. Cloud Computing Essentials
3. Full Stack Development
4. Data Science & Analytics

## Documentation

For detailed setup instructions, see [SETUP.md](SETUP.md)

## License

ISC
