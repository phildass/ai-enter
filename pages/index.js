import Layout from '../components/Layout';
import Link from 'next/link';

const products = [
  {
    key: 'iiskills',
    name: 'IISkills',
    tagline: 'Professional skills and learning apps',
    description: 'A suite of learning applications for professional development, skill-building, and career advancement.',
    domain: 'iiskills.cloud',
    paymentPath: '/payments/iiskills',
    color: '#7c3aed',
    bg: '#ede9fe',
    emoji: '📚',
  },
  {
    key: 'jaibharat',
    name: 'Jai Bharat',
    tagline: 'Government jobs & exam preparation',
    description: 'Comprehensive platform for government job discovery and exam prep across India — banks, UPSC, SSC, Railways, and more.',
    domain: 'jaibharat.cloud',
    paymentPath: '/payments/jaibharat',
    color: '#4f46e5',
    bg: '#e0e7ff',
    emoji: '🏛️',
  },
  {
    key: 'jaikisan',
    name: 'Jai Kisan',
    tagline: 'Farmer assistant in 12+ Indian languages',
    description: 'Voice-driven assistant for farmers across India — fertilizers, weather, market rates, and crop guidance via oral commands.',
    domain: 'jaikisan.cloud',
    paymentPath: '/payments/jaikisan',
    color: '#16a34a',
    bg: '#dcfce7',
    emoji: '🌾',
  },
];

export default function Home() {
  return (
    <Layout title="AI Cloud Enterprises - Building Software Solutions for Public and Private Use">
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 700px;
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
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.35);
          z-index: 0;
        }

        .hero-content {
          max-width: 1000px;
          z-index: 1;
          position: relative;
        }

        .hero h1 {
          font-size: 4rem;
          margin-bottom: 1.5rem;

        font-weight: 700;
          color: #667eea;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero p {
          font-size: 1.5rem;
          margin-bottom: 2.5rem;
          color: #667eea;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);



          font-weight: 800;
          text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .hero p {
          font-size: 1.6rem;
          margin-bottom: 3rem;
          opacity: 0.98;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
          font-weight: 500;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1.2rem 3rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.95);
          color: #667eea;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary:hover {
          transform: translateY(-3px);
          background: white;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);



        }

        .container {
          max-width: 1300px;
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
          font-size: 3rem;
          color: #667eea;
          margin-bottom: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.2rem;
          color: #666;
          max-width: 900px;
          margin: 0 auto 4rem;
          line-height: 1.8;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2.5rem;
          margin-top: 4rem;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          border: 1px solid rgba(102, 126, 234, 0.1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.2);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .feature-card h3 {
          color: #667eea;
          font-size: 1.7rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .feature-card p {
          color: #666;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .value-card {
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          padding: 2.5rem;
          border-radius: 15px;
          text-align: center;
          border: 2px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }

        .value-card:hover {
          border-color: #667eea;
          transform: scale(1.05);
        }

        .value-number {
          font-size: 3rem;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .value-label {
          font-size: 1.1rem;
          color: #555;
          font-weight: 600;
        }

        .info-section {
          background: white;
          border-radius: 25px;
          padding: 4rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          margin: 3rem 0;
        }

        .info-section p {
          font-size: 1.2rem;
          color: #666;
          line-height: 2;
          margin-bottom: 1.5rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-top: 4rem;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.15);
        }

        .product-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 1.25rem;
        }

        .product-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.4rem;
          font-weight: 700;
        }

        .product-tagline {
          font-size: 0.95rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 0.75rem;
        }

        .product-desc {
          color: #666;
          line-height: 1.7;
          font-size: 0.95rem;
          margin-bottom: 1.25rem;
        }

        .product-links {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .product-link-ext {
          font-size: 0.85rem;
          color: #667eea;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 600px;
            padding: 4rem 1.5rem;
          }

          .hero h1 {
            font-size: 2.8rem;
          }

          .hero p {
            font-size: 1.3rem;
          }

          .cta-buttons {
            flex-direction: column;
            gap: 1rem;
          }

          .btn {
            padding: 1rem 2rem;
            width: 100%;
          }

          .section-title {
            font-size: 2.2rem;
          }

          .feature-card {
            padding: 2rem;
          }

          .info-section {
            padding: 2.5rem;
          }
        }
      `}</style>

      <div className="hero">
        <div className="hero-content">
          <h1>AI Cloud Enterprises</h1>
          <p>Building software solutions for public and private use</p>
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

        <div className="section">
          <h2 className="section-title">What We Do</h2>
          <p className="section-subtitle">
            AI Cloud Enterprises designs and operates software platforms for education, public services, and agriculture — serving individuals, institutions, and enterprises across India.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Product Engineering</h3>
              <p>We build and maintain purpose-built SaaS platforms for defined domains — from professional learning to government job discovery and farmer assistance.</p>
            </div>

            <div className="feature-card">
              <h3>AI-Enabled Solutions</h3>
              <p>Our products incorporate AI and voice capabilities to serve users in multiple Indian languages, making digital services accessible to a broader population.</p>
            </div>

            <div className="feature-card">
              <h3>Secure Payment Infrastructure</h3>
              <p>We operate a shared, Razorpay-backed payment gateway on behalf of our product brands, with signed token verification and webhook integrity checks.</p>
            </div>

            <div className="feature-card">
              <h3>Citizen &amp; Public Sector Services</h3>
              <p>Platforms designed for India's public — government job seekers, farmers, and skill builders — with appropriate language support and offline-tolerant design.</p>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section">
          <h2 className="section-title">Our Products</h2>
          <p className="section-subtitle">
            Focused platforms serving distinct user needs — connected through a shared, secure payment infrastructure.
          </p>

          <div className="products-grid">
            {products.map((product) => (
              <div key={product.key} className="product-card" style={{ borderTop: `4px solid ${product.color}` }}>
                <div className="product-icon" style={{ background: product.bg, color: product.color }}>
                  {product.emoji}
                </div>
                <h3 style={{ color: product.color }}>{product.name}</h3>
                <p className="product-tagline">{product.tagline}</p>
                <p className="product-desc">{product.description}</p>
                <div className="product-links">
                  <a href={`https://${product.domain}`} target="_blank" rel="noopener noreferrer" className="product-link-ext">
                    {product.domain}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section">
          <h2 className="section-title">Security &amp; Trust</h2>
          <p className="section-subtitle">
            Payments and data handled with industry-standard security practices.
          </p>
          <div className="info-section">
            <p>
              All payments are processed through <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway. We do not store card or banking credentials on our servers.
            </p>
            <p>
              Cross-platform payment handoffs use HMAC-signed tokens with expiry validation. Webhook callbacks to product platforms are signed and verified for integrity.
            </p>
            <p>
              User data is stored in a secured database with role-level access controls. We comply with applicable Indian data protection guidelines.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
