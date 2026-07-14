## AI-Enter: Comprehensive Documentation

### 📋 Project Overview

**AI-Enter** is a payment gateway aggregator that handles course purchases from multiple educational platforms (appmall, jai-bharat, jai-kisan, iisacademy) and processes payments through **Razorpay**, then confirms purchases back to origin platforms.

**Live URL:** https://aienter.in

### 🏗️ Architecture

```
Origin Sites (appmall, jai-bharat, etc.)
         ↓ (generates payment token)
  aienter.in payment page
         ↓ (user completes payment)
  Razorpay Payment Gateway
         ↓ (verification)
  /api/payments/verify-payment
         ↓ (confirm purchase)
  Origin Site Webhook / appmall Confirm Endpoint
         ↓ (grant access)
  User Dashboard with Paid Badge
```

### 🚀 Deployment

**Hosting:** Hostinger (Shared Hosting with Node.js support)

**Deployment Process:**
1. Code pushed to GitHub (`phildass/ai-enter`)
2. Go to Hostinger hPanel
3. Select **aienter.in** → **Deploy** button
4. Hostinger automatically:
   - Pulls latest code from GitHub
   - Runs `npm install`
   - Runs `npm run build` (Next.js build)
   - Restarts the application

**Branch:** `main` (production)

### 📁 Project Structure

```
ai-enter/
├── pages/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── create-order.js          # Create Razorpay order
│   │   │   ├── verify-payment.js        # Verify & confirm payment
│   │   │   └── verify-payment.js.bak    # Backup
│   │   ├── create-order.js              # Legacy endpoint
│   │   ├── verify-payment.js            # Legacy endpoint
│   │   └── webhooks/
│   │       └── razorpay.js              # Razorpay webhook handler
│   ├── payments/
│   │   ├── appmall.js                  # appmall payment page
│   │   ├── jaibharat.js                 # jai-bharat payment page
│   │   ├── jaikisan.js                  # jai-kisan payment page
│   │   ├── iisacademy.js                # iisacademy payment page
│   │   ├── iisacademy2.js               # iisacademy variant 2
│   │   └── (appmall only)
│   │   ├── jaibharatpay.js              # jai-bharat payment flow
│   │   ├── jaikisanpay.js               # jai-kisan payment flow
│   │   └── success.js                   # Payment success page (auto-redirects)
│   ├── index.js                         # Home page
│   ├── about.js                         # About page
│   ├── contact.js                       # Contact page
│   ├── login.js                         # Login page
│   ├── register.js                      # Register page
│   ├── solutions.js                     # Solutions page
│   ├── privacy.js                       # Privacy policy
│   ├── terms.js                         # Terms of service
│   └── _app.js                          # Next.js App wrapper
├── lib/
│   ├── verifyAppmallToken.js           # JWT verification for appmall tokens
│   └── (uriq removed)
│   ├── verifyHandoffToken.js            # Token verification for origin sites
│   ├── handoff.js                       # Webhook signing utilities
│   ├── courses.js                       # Course data & pricing logic
│   └── payments.js                      # Payment utilities
├── components/
│   ├── SegmentPaymentPage.js            # Reusable payment form component
│   └── [other components]
├── public/
│   └── [static assets]
├── .env.example                         # Environment variables template
├── .env.production                      # Production environment config
├── package.json                         # Dependencies
├── next.config.js                       # Next.js configuration
├── Update.md                            # This file
└── README.md                            # Project README
```

### 🔑 Environment Variables (Hostinger)

**Required for production:**

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxx           # From https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_SECRET=xxxxx                # Secret key (backend only)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx  # Public key for frontend

# Razorpay Webhook Secret
RAZORPAY_WEBHOOK_SECRET=xxxxx            # From https://dashboard.razorpay.com/app/webhooks

# Supabase (optional but enables idempotency & transaction tracking)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Origin Site Integration (jai-bharat, jai-kisan, iisacademy)
HANDOFF_SIGNING_SECRET=xxxxx             # Shared with origin sites
ORIGIN_WEBHOOK_SECRET=xxxxx              # For signing outgoing webhooks

# Webhook URLs for origin sites
JAI_KISAN_WEBHOOK_URL=https://jaikisan.cloud/api/payments/ai-enter/callback
JAI_BHARAT_WEBHOOK_URL=https://jaibharat.cloud/api/payments/ai-enter/callback
IISACADEMY_WEBHOOK_URL=https://iisacademy.in/api/payments/ai-enter/callback

# appmall Integration
APPMALL_PAYMENT_TOKEN_SECRET=xxxxx      # JWT secret from appmall
AIENTER_CONFIRMATION_SIGNING_SECRET=xxxxx # For signing appmall confirm requests
APPMALL_CONFIRM_URL=https://appmall.in/api/payments/confirm  # appmall confirm endpoint
```

### 💳 Payment Flow: appmall.in Integration (Live)

**Step 1: Token Generation**
- User on appmall.in clicks "Pay with AI-Enter"
- appmall generates JWT token with:
  - `purchaseId`: Unique purchase ID
  - `courseSlug`: Selected course (learn-ai, learn-developer, etc.)
  - `user_id`: appmall user ID
  - `phone`: User phone number
  - `name`: User name
  - `exp`: Token expiration time

**Step 2: Payment Page**
```
GET /payments/appmall?token=<jwt_token>
```
- Token validated in `getServerSideProps` using `APPMALL_PAYMENT_TOKEN_SECRET`
- User details displayed (name, phone, course)
- Pricing shown: ₹99 + 18% GST = ₹116.82

**Step 3: Create Razorpay Order**
```
POST /api/payments/create-order
Body: {
  appmall_token: <jwt>,
  purchaseId: <id>,
  course: <course_slug>
}
```
- Backend verifies token
- Creates Razorpay order for ₹116.82 (11682 paise)
- Returns: `orderId`, `amount`, `keyId`
- Order stored in Supabase `payment_transactions` table

**Step 4: Razorpay Checkout Modal**
- Frontend loads Razorpay checkout script
- Modal opens in browser with payment options (card, UPI, netbanking, etc.)
- User completes payment

**Step 5: Verify & Confirm**
```
POST /api/payments/verify-payment
Body: {
  razorpay_order_id: <order_id>,
  razorpay_payment_id: <payment_id>,
  razorpay_signature: <signature>,
  appmall_token: <jwt>,
  purchaseId: <purchase_id>
}
```
- Backend verifies Razorpay signature using `RAZORPAY_KEY_SECRET`
- Calls appmall confirm endpoint:
```
POST https://appmall.in/api/payments/confirm
Headers:
  x-aienter-signature: HMAC-SHA256(body, AIENTER_CONFIRMATION_SIGNING_SECRET)
  x-aienter-timestamp: Unix timestamp
Body: {
  purchaseId: <purchase_id>,
  appId: <course_slug>,
  amountPaise: 11682,
  razorpayOrderId: <order_id>,
  razorpayPaymentId: <payment_id>,
  paidAt: <ISO timestamp>,
  user_token: <jwt_token>
}
```
- appmall confirms purchase and grants access
- Supabase updated with payment status: `success`
- Returns redirect URL from appmall

**Step 6: Success Page & Auto-Redirect**
```
GET /payments/success
```
- Shows confirmation: "Payment Successful! ₹116.82"
- Auto-redirects to `https://appmall.in/dashboard` after 3 seconds
- User sees "Paid User" badge in appmall dashboard
- Can access all paid courses

### 🔐 Security Features

**1. Token Verification (appmall)**
- JWT validated with `APPMALL_PAYMENT_TOKEN_SECRET`
- Checks signature, expiration, course slug, and purchase ID
- Direct access to payment page blocked (must have valid token)

**2. Razorpay Signature Verification**
- HMAC-SHA256 signature verified on every payment
- Prevents tampering with payment data

**3. Webhook Signing (appmall confirm)**
- HMAC-SHA256 signature sent in `x-aienter-signature` header
- appmall verifies using `AIENTER_CONFIRMATION_SIGNING_SECRET`
- Replay protection via `x-aienter-timestamp`

**4. CORS & Origin Validation**
- Only appmall.in can initiate payments
- Direct access attempts show security warning

### 📊 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Razorpay Integration | ✅ Live | Full payment gateway integration |
| appmall Integration | ✅ Live | Token-based payment flow |
| JWT Verification | ✅ Live | Secure token validation |
| Supabase Tracking | ✅ Live | Payment transaction logging |
| Auto-Redirect | ✅ Live | Redirect to dashboard after payment |
| Idempotency | ✅ Live | Prevents duplicate orders |
| Webhook Confirmation | ✅ Live | Notifies origin sites of payment |
| Multiple Origins | ⚙️ Partial | jai-bharat, jai-kisan, iisacademy configured |

### 🔧 API Endpoints

**Payment Creation:**
- `POST /api/payments/create-order`
  - Creates Razorpay order
  - Input: token, purchaseId, course
  - Output: orderId, amount, keyId

**Payment Verification:**
- `POST /api/payments/verify-payment`
  - Verifies Razorpay signature
  - Confirms payment with origin site
  - Input: razorpay IDs, signature, token
  - Output: success status, redirect URL

**Webhook Handler:**
- `POST /api/webhooks/razorpay`
  - Handles Razorpay webhook events (optional)

### 📦 Dependencies

**Core:**
- `next`: 15.5.12 (React framework)
- `react`: 19.x
- `razorpay`: Latest (payment gateway)

**Database & API:**
- `@supabase/supabase-js`: Supabase client

**Utilities:**
- `crypto`: Built-in Node.js (token verification)

### 🐛 Troubleshooting

**Issue: "Payment processing would start here" alert**
- ❌ Old code bug (token not passed to payment handler)
- ✅ Fixed in commit: `3ad8b2c3f5be29694554e5fcca32fe6d14d655d8`

**Issue: rawToken is not defined**
- ❌ Prop not extracted from `getServerSideProps`
- ✅ Fixed in commit: `3ad8b2c3f5be29694554e5fcca32fe6d14d655d8`

**Issue: Payment gateway doesn't open**
- Check: `RAZORPAY_KEY_ID` is set in Hostinger .env
- Check: Razorpay script loads: https://checkout.razorpay.com/v1/checkout.js
- Check: Browser console for errors

**Issue: "Payment verification failed"**
- Check: `RAZORPAY_KEY_SECRET` is correct
- Check: Razorpay order ID matches payment ID
- Check: Signature computation is correct

**Issue: appmall confirmation fails**
- Check: `AIENTER_CONFIRMATION_SIGNING_SECRET` matches appmall config
- Check: `APPMALL_CONFIRM_URL` is correct
- Check: Timestamp is within acceptable range

### 📝 Recent Changes

**Commit: 3093f78** - Auto-redirect to appmall dashboard
- Success page now redirects after 3 seconds
- Added "Go to Dashboard Now" button
- Shows countdown message

**Commit: 3ad8b2c** - Fix rawToken prop passing
- Token properly passed from `getServerSideProps` to component
- Razorpay integration fully functional

**Commit: d2ff5c4** - Implement Razorpay payment integration
- Replaced mock alert with real Razorpay checkout
- Added order creation and verification flow

**Commit: 29efa10** - Fix token verification and remove debug logging
- Removed excessive console.log statements
- Fixed memory overflow on Hostinger
- Stable performance achieved

### 🔄 Git Workflow

**To Deploy Changes:**

```bash
# 1. On local machine, make changes
cd C:\Users\pdake\cloud\ai-enter
git add -A
git commit -m "Describe changes"
git push origin main

# 2. On Hostinger hPanel
- Go to aienter.in
- Click "Deploy" button
- Wait 30-60 seconds for deployment
- Check site: https://aienter.in
```

**Current Branch:** `main` (production)
**Repository:** https://github.com/phildass/ai-enter

### 📞 Support

- **appmall Support:** support@appmall.in
- **Site Admin:** phildass (GitHub)
- **Server:** Hostinger (cpanel)

### ✨ Next Steps (Future Enhancements)

- [ ] Email notifications for successful payments
- [ ] Admin dashboard for transaction viewing
- [ ] Payment refund handling
- [ ] Multi-language support
- [ ] Mobile app payment integration
- [ ] Advanced analytics & reporting

---

**Last Updated:** June 8, 2026
**Status:** ✅ Fully Operational
**Payment Processing:** ✅ Live with Razorpay
