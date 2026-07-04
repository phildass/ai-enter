export const SUPPORTED_PAYMENT_APPS = ['iiskills'];

export function isSupportedPaymentApp(appName) {
  return SUPPORTED_PAYMENT_APPS.includes(appName);
}

export function getRazorpayCredentialsForApp(appName) {
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
