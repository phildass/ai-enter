import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Backward-compatible redirect: old /payments/jaibharatpay -> new /payments/jaibharat
export default function JaiBharatPayLegacy() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const params = new URLSearchParams(router.query);
    const qs = params.toString();
    router.replace(`/payments/jaibharat${qs ? `?${qs}` : ''}`);
  }, [router, router.isReady, router.query]);

  return null;
}
