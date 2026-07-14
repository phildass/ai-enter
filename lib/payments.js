export const SUPPORTED_PAYMENT_APPS = ['appmall'];

export function isSupportedPaymentApp(appName) {
  return SUPPORTED_PAYMENT_APPS.includes(appName);
}

export function getRazorpayCredentialsForApp(appName) {
  return {
    keyId: process.env.RAZORPAY_KEY_ID_APPMALL || process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET_APPMALL || process.env.RAZORPAY_KEY_SECRET,
    publicKey:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_APPMALL ||
      process.env.RAZORPAY_KEY_ID_APPMALL ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID,
  };
}
