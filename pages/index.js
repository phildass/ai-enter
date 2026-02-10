import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the static index.html
    window.location.href = '/index.html';
  }, [router]);

  return null;
}
