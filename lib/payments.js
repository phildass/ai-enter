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

  // default to iiskills credentials
  return {
    keyId: process.env.RAZORPAY_KEY_ID_IISKILLS,
    keySecret: process.env.RAZORPAY_KEY_SECRET_IISKILLS,
    publicKey:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_IISKILLS || process.env.RAZORPAY_KEY_ID_IISKILLS,
  };
}
