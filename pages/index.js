import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  const products = [
    {
      key: 'iiskills',
      name: 'IISkills',
      tagline: 'Professional skills and learning applications for career growth.',
      domain: 'iiskills.cloud',
      paymentPath: '/payments/iiskills',
      color: '#7c3aed',
      bg: '#ede9fe',
      icon: '🎓',
    },
    {
      key: 'jaibharat',
      name: 'Jai Bharat',
      tagline: 'Government jobs discovery and exam preparation across India — banks, UPSC, SSC, Railways and more.',
      domain: 'jaibharat.cloud',
      paymentPath: '/payments/jaibharat',
      color: '#1d4ed8',
      bg: '#dbeafe',
      icon: '🇮🇳',
    },
    {
      key: 'jaikisan',
      name: 'Jai Kisan',
      tagline: 'Farmer assistant platform with voice and oral commands in 12+ Indian languages — fertilizers, weather, market rates, crops and commodities.',
      domain: 'jaikisan.cloud',
      paymentPath: '/payments/jaikisan',
      color: '#16a34a',
      bg: '#dcfce7',
      icon: '🌾',
    },
  ];

  return (
    <Layout
      title="AI Cloud Enterprises — Building Software Solutions for Public and Private Use"
      description="AI Cloud Enterprises is a corporate software company building AI-enabled platforms for education, public sector, agriculture, and citizen services across India."
    >
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 680px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('/images/aienter_hero5.jpg');
          background-size: cover;
          background-position: center;
          color: white;
          text-align: center;
          padding: 6rem 2rem;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(10, 15, 40, 0.55);
          z-index: 0;
        }

        .hero-content {
          max-width: 900px;
          z-index: 1;
          position: relative;
        }

        .hero-eyebrow {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin-bottom: 1rem;
        }

        .hero h1 {
          font-size: 3.6rem;
          margin-bottom: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .hero p {
          font-size: 1.35rem;
          margin-bottom: 2.5rem;
          color: rgba(255,255,255,0.88);
          font-weight: 400;
          line-height: 1.6;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1.25rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        :global(.btn) {
          padding: 1rem 2.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          border: none;
        }

        :global(.btn-primary) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        :global(.btn-primary:hover) {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.55);
        }

        :global(.btn-secondary) {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border: 2px solid rgba(255,255,255,0.5);
        }

        :global(.btn-secondary:hover) {
          background: rgba(255, 255, 255, 0.22);
          transform: translateY(-3px);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5rem 2rem;
        }

        .section {
          margin-bottom: 6rem;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
          margin: 5rem 0;
        }

        .section-title {
          text-align: center;
          font-size: 2.4rem;
          color: #1a1a2e;
          margin-bottom: 1rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.1rem;
          color: #555;
          max-width: 800px;
          margin: 0 auto 3.5rem;
          line-height: 1.8;
        }

        .what-we-do-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .what-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: box-shadow 0.3s ease;
        }

        .what-card:hover {
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.18);
        }

        .what-card-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #667eea;
          margin-bottom: 0.75rem;
        }

        .what-card h3 {
          color: #1a1a2e;
          font-size: 1.3rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .what-card p {
          color: #666;
          line-height: 1.75;
          font-size: 0.98rem;
        }

        .industries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .industry-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          padding: 2rem;
          border-radius: 14px;
          text-align: center;
          border: 1.5px solid rgba(102, 126, 234, 0.12);
          transition: border-color 0.3s ease;
        }

        .industry-card:hover {
          border-color: #667eea;
        }

        .industry-icon {
          font-size: 2.2rem;
          margin-bottom: 0.75rem;
          display: block;
        }

        .industry-card h3 {
          color: #1a1a2e;
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }

        .industry-card p {
          color: #777;
          font-size: 0.88rem;
          line-height: 1.5;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .product-card {
          background: white;
          border-radius: 18px;
          padding: 2.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
        }

        .product-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 1.25rem;
        }

        .product-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
        }

        .product-card p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .product-links {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .product-link {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.45rem 1rem;
          border-radius: 20px;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .product-link:hover {
          opacity: 0.8;
        }

        .product-link-primary {
          color: white;
        }

        .product-link-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .trust-section {
          background: white;
          border-radius: 20px;
          padding: 3.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          margin-top: 2.5rem;
        }

        .trust-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .trust-icon {
          font-size: 1.6rem;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .trust-item h4 {
          color: #1a1a2e;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .trust-item p {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 580px;
            padding: 4rem 1.5rem;
          }

          .hero h1 {
            font-size: 2.4rem;
          }

          .hero p {
            font-size: 1.1rem;
          }

          .cta-buttons {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 280px;
            text-align: center;
          }

          .section-title {
            font-size: 1.9rem;
          }

          .trust-section {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">AI Cloud Enterprises</p>
          <h1>Building Software Solutions for Public and Private Use</h1>
          <p>
            We design and operate AI-enabled platforms serving education, public services, agriculture,
            and citizen needs across India.
          </p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn btn-primary">
              Contact Us
            </Link>
            <Link href="/payments" className="btn btn-secondary">
              Payments Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="container">

        {/* What We Do */}
        <div className="section">
          <h2 className="section-title">What We Do</h2>
          <p className="section-subtitle">
            AI Cloud Enterprises builds and operates software platforms for real-world impact —
            from professional learning to government services and agricultural intelligence.
          </p>
          <div className="what-we-do-grid">
            <div className="what-card">
              <div className="what-card-label">Product Engineering</div>
              <h3>End-to-End Platform Development</h3>
              <p>We architect, build, and maintain scalable SaaS products — from concept to production — with a focus on reliability and user experience.</p>
            </div>
            <div className="what-card">
              <div className="what-card-label">AI &amp; Intelligence</div>
              <h3>AI-Enabled Applications</h3>
              <p>Our products incorporate AI for voice interfaces, content delivery, exam preparation, and agricultural advisory at scale.</p>
            </div>
            <div className="what-card">
              <div className="what-card-label">Payments Infrastructure</div>
              <h3>Secure Payment Gateway</h3>
              <p>We operate a shared, Razorpay-integrated payment gateway serving multiple product verticals with HMAC-signed handoff and webhook verification.</p>
            </div>
            <div className="what-card">
              <div className="what-card-label">Digital Inclusion</div>
              <h3>Multilingual &amp; Accessible</h3>
              <p>Our platforms support 12+ Indian languages, voice-first interfaces, and low-bandwidth environments to reach every corner of India.</p>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Industries */}
        <div className="section">
          <h2 className="section-title">Industries We Serve</h2>
          <p className="section-subtitle">
            Our platforms are purpose-built for sectors where digital access creates the greatest impact.
          </p>
          <div className="industries-grid">
            <div className="industry-card">
              <span className="industry-icon">📚</span>
              <h3>Professional Education</h3>
              <p>Skill-building and career-readiness platforms for working professionals.</p>
            </div>
            <div className="industry-card">
              <span className="industry-icon">🏛️</span>
              <h3>Public Sector</h3>
              <p>Government exam preparation and job discovery for millions of aspirants.</p>
            </div>
            <div className="industry-card">
              <span className="industry-icon">🌾</span>
              <h3>Agriculture</h3>
              <p>Voice-first advisory tools for farmers on weather, crops, and market rates.</p>
            </div>
            <div className="industry-card">
              <span className="industry-icon">🤝</span>
              <h3>Citizen Services</h3>
              <p>Digital platforms that bridge the gap between citizens and essential information.</p>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Our Products */}
        <div className="section">
          <h2 className="section-title">Our Products</h2>
          <p className="section-subtitle">
            Three distinct platforms, each serving a specific audience — unified by shared infrastructure and values.
          </p>
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.key} className="product-card">
                <div className="product-icon-wrap" style={{ background: p.bg }}>
                  <span>{p.icon}</span>
                </div>
                <h3 style={{ color: p.color }}>{p.name}</h3>
                <p>{p.tagline}</p>
                <div className="product-links">
                  <a
                    href={`https://${p.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-link product-link-primary"
                    style={{ background: p.color }}
                  >
                    Visit {p.name}
                  </a>
                  <Link href={p.paymentPath} className="product-link product-link-secondary">
                    Make a Payment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider"></div>

        {/* Security & Trust */}
        <div className="section">
          <h2 className="section-title">Security &amp; Trust</h2>
          <p className="section-subtitle">
            We take data security and payment integrity seriously across all our products.
          </p>
          <div className="trust-section">
            <div className="trust-grid">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <div>
                  <h4>Secure Payments</h4>
                  <p>All transactions are processed via Razorpay. We do not store card or banking credentials on our servers.</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔑</span>
                <div>
                  <h4>HMAC-Signed Handoffs</h4>
                  <p>Payment handoff tokens are cryptographically signed and verified server-side before any order is created.</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📋</span>
                <div>
                  <h4>Privacy Compliance</h4>
                  <p>We collect only the information necessary to process your transaction and deliver our services.</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚙️</span>
                <div>
                  <h4>Webhook Verification</h4>
                  <p>All outgoing notifications to partner platforms are signed with a shared secret to prevent spoofing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
