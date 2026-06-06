import Layout from '../components/Layout';

export default function Payments() {
  return (
    <Layout title="Payments — AI Cloud Enterprises">
      <style jsx>{`
        .payments-container {
          max-width: 800px;
          margin: 4rem auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .info-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }

        h1 {
          color: #667eea;
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        p {
          color: #555;
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .highlight {
          color: #667eea;
          font-weight: 600;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          margin-top: 1rem;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
          .payments-container {
            margin: 2rem auto;
            padding: 1.5rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          p {
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="payments-container">
        <div className="info-icon">💳</div>
        <h1>Payments</h1>
        <p>
          Direct payments cannot be made on this page. To make a payment and enroll in any course, please visit <span className="highlight">iiskills.in</span>.
        </p>
        <a href="https://iiskills.in" className="cta-button">
          Go to iiskills.in
        </a>
      </div>
    </Layout>
  );
}
