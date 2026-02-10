# AI Cloud Enterprises

Modern, elegant corporate platform for AI Cloud Enterprises offering premium courses in AI, PR, Management, Professional Skills, Government Jobs, and Software Development with integrated course enrollment and payments.

## Overview

This is a Next.js-based platform offering six specialized courses designed to empower professional careers. Features a modern, corporate design with integrated Razorpay payment gateway and Supabase database for tracking enrollments.

## Features

- 🎨 Modern, corporate UI with elegant design and responsive layout
- 🏠 Complete site with Home, Solutions, About, Contact, Payment, Privacy Policy, and Terms & Conditions pages
- 📚 Six specialized courses with unified pricing
- 🎁 Special combo offer: Learn AI + Learn Developer at Learn AI price
- 💳 Secure payment processing with Razorpay
- 📊 Enrollment tracking in Supabase database
- 🎯 Streamlined payment flow with course selection
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

- **Home (/)** - Hero section with AI Cloud Enterprises branding, feature highlights, and stats
- **Solutions (/solutions)** - Overview of all six courses and their benefits
- **About (/about)** - Mission, approach, and core values
- **Contact (/contact)** - Contact information and message form
- **Payment (/payment)** - Secure payment form with course selection and Razorpay integration
- **Privacy Policy (/privacy)** - Privacy policy and data handling practices
- **Terms & Conditions (/terms)** - Terms of service and refund policy
- **Success (/success)** - Enrollment confirmation page

## Pricing

All courses have the same fee structure:

- **Early Bird (Till Feb 28, 2026):** ₹99 + 18% GST (₹17.82) = ₹116.82 total
- **Regular (From March 1, 2026):** ₹299 + 18% GST (₹53.82) = ₹352.82 total

## Available Courses

1. **Learn AI** - Master artificial intelligence and machine learning
2. **Learn PR** - Master public relations and corporate communications
3. **Learn Management** - Develop essential leadership and management skills
4. **Learn Finesse** - Master professional etiquette and interpersonal skills
5. **Learn Govt Jobs** - Comprehensive government job exam preparation
6. **Learn Developer** - Build professional software development skills
7. **Learn AI + Learn Developer** (Combo) - Both courses at the price of Learn AI!

## Documentation

For detailed setup instructions, see [SETUP.md](SETUP.md)

## License

ISC
