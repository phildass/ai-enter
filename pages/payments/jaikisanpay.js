import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Backward-compatible redirect: old /payments/jaikisanpay -> new /payments/jaikisan
export default function JaiKisanPayLegacy() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const params = new URLSearchParams(router.query);
    const qs = params.toString();
    router.replace(`/payments/jaikisan${qs ? `?${qs}` : ''}`);
  }, [router, router.isReady, router.query]);

  return null;
}
