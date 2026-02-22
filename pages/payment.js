import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Payment() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/payments');
  }, [router]);

  return (
    <p style={{ textAlign: 'center', marginTop: '4rem', color: '#667eea' }}>
      Redirecting to payments…
    </p>
  );
}
