export const SUPPORTED_PAYMENT_APPS = ['iiskills', 'uriq.in'];

export function isSupportedPaymentApp(appName) {
  return SUPPORTED_PAYMENT_APPS.includes(appName);
}

export function getRazorpayCredentialsForApp(appName) {
  if (appName === 'uriq.in') {
    return {
      keyId: process.env.RAZORPAY_KEY_ID_URIQ,
      keySecret: process.env.RAZORPAY_KEY_SECRET_URIQ,
      publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_URIQ || process.env.RAZORPAY_KEY_ID_URIQ,
    };
  }

  // default to iiskills credentials (legacy RAZORPAY_KEY_* names still supported on server)
  return {
    keyId: process.env.RAZORPAY_KEY_ID_IISKILLS || process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET_IISKILLS || process.env.RAZORPAY_KEY_SECRET,
    publicKey:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_IISKILLS ||
      process.env.RAZORPAY_KEY_ID_IISKILLS ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID,
  };
}
