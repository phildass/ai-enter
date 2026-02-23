import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Crowdfund() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) return 'Enter a valid 10-digit Indian mobile number.';
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt < 100) return 'Minimum amount is ₹100.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Failed to load payment gateway. Please try again.');

      const orderRes = await fetch('/api/create-crowdfund-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountInr: Number(amount), name: name.trim(), phone: phone.trim() }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'AI Cloud Enterprises',
        description: 'Crowdfund Contribution',
        prefill: { name: name.trim(), contact: phone.trim() },
        notes: { type: 'crowdfund', name: name.trim(), phone: phone.trim() },
        config: { display: { blocks: { upi: { name: 'UPI', instruments: [{ method: 'upi' }] } }, sequence: ['block.upi'], preferences: { show_default_blocks: true } } },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/verify-crowdfund-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amountInr: Number(amount),
                name: name.trim(),
                phone: phone.trim(),
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok) throw new Error(verifyData.error || 'Verification failed');
            router.push(`/crowdfund/success?payment_id=${response.razorpay_payment_id}&amount=${amount}`);
          } catch (err) {
            setError(err.message);
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Support Us – AI Cloud Enterprises</title>
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
        }
        h1 {
          color: #667eea;
          font-size: 2rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .subtitle {
          color: #888;
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1rem;
        }
        .field {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          font-weight: 600;
          color: #444;
          margin-bottom: 0.4rem;
          font-size: 0.95rem;
        }
        input {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        input:focus {
          border-color: #667eea;
        }
        .error {
          background: #fff0f0;
          color: #c0392b;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        .btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          font-family: inherit;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn:not(:disabled):hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }
        .hint {
          color: #aaa;
          font-size: 0.82rem;
          margin-top: 0.3rem;
        }
      `}</style>
      <div className="page">
        <div className="card">
          <h1>💛 Support Us</h1>
          <p className="subtitle">Every contribution helps us grow. Thank you!</p>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="hint">Indian mobile number (e.g. 9876543210)</p>
            </div>
            <div className="field">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                placeholder="Minimum ₹100"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="hint">Minimum contribution: ₹100</p>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing…' : 'Contribute Now'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
