import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function CrowdfundSuccess() {
  const router = useRouter();
  const { payment_id, amount } = router.query;

  return (
    <>
      <Head>
        <title>Thank You! – AI Cloud Enterprises</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8f9ff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        .card {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 480px;
          text-align: center;
        }
        .icon {
          font-size: 4.5rem;
          margin-bottom: 1rem;
          animation: pop 0.5s ease-out;
        }
        @keyframes pop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        h1 {
          color: #667eea;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          color: #666;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }
        .details {
          background: #f8f9ff;
          border-left: 4px solid #667eea;
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          text-align: left;
          margin-bottom: 2rem;
        }
        .details p {
          margin: 0.4rem 0;
          font-size: 0.95rem;
          color: #555;
        }
        .details strong {
          color: #667eea;
        }
        .btn {
          display: inline-block;
          padding: 0.9rem 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: transform 0.2s, opacity 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="icon">🎉</div>
          <h1>Thank You!</h1>
          <p>Your contribution has been received. We truly appreciate your support!</p>
          {(amount || payment_id) && (
            <div className="details">
              {amount && (
                <p>Amount: <strong>₹{Number(amount).toLocaleString('en-IN')}</strong></p>
              )}
              {payment_id && (
                <p>Payment ID: <strong>{payment_id}</strong></p>
              )}
            </div>
          )}
          <Link href="/" className="btn">Back to Home</Link>
        </div>
      </div>
    </>
  );
}
