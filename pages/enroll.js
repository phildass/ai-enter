import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Enroll() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to payment page
    router.replace('/payment');
  }, [router]);

  return null;
}
