import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout title="AI Cloud Enterprises - Transform Your Future with AI">
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 700px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('/images/iiskills-aienter-hero2.jpg');
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

        .value-props {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
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
          <p>Smart SaaS Solutions for India's Digital Future</p>
          <div className="cta-buttons">
            <Link href="/solutions" className="btn btn-primary">
              Explore Solutions
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section">
          <h2 className="section-title">Why Choose AI Cloud Enterprises?</h2>
          <p className="section-subtitle">
            Empowering businesses and individuals across India with cutting-edge technology solutions and affordable skill enhancement programs
          </p>

          <div className="info-section">
            <p>
              At AI Cloud Enterprises we offer Skill Enhancement Courses through iiskills.cloud. There are foundational free courses and premium paid courses—all available at very reasonable prices that every Indian can afford.
            </p>
            <p>
              AI Cloud Enterprises also delivers SaaS-based solutions for scalable training, development, and app creation across universal uses and industries. Our expertise covers the development of education platforms, business automation apps, and digital transformation tools for organizations nationwide.
            </p>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive solutions that touch every aspect of digital transformation
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🎓</span>
              <h3>Skill Enhancement</h3>
              <p>Access free and premium courses through iiskills.cloud. From foundational to advanced topics, we make quality education affordable for every Indian.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">☁️</span>
              <h3>SaaS Solutions</h3>
              <p>Scalable, cloud-based platforms designed for businesses of all sizes. Our solutions grow with your organization's needs.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3>App Development</h3>
              <p>Custom mobile and web applications tailored to your industry. From education platforms to business automation tools.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🚀</span>
              <h3>Digital Transformation</h3>
              <p>Complete digital transformation services for organizations. We help you modernize operations and reach new heights.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🏢</span>
              <h3>Enterprise Solutions</h3>
              <p>Robust business automation and management systems designed for the unique challenges of Indian enterprises.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">💡</span>
              <h3>Innovation Partners</h3>
              <p>Work with us to bring your innovative ideas to life. We're committed to building India's digital future together.</p>
            </div>
          </div>
        </div>

        <div className="section-divider"></div>

        <div className="section">
          <h2 className="section-title">Our Impact</h2>
          <div className="value-props">
            <div className="value-card">
              <div className="value-number">10K+</div>
              <div className="value-label">Students Enrolled</div>
            </div>
            <div className="value-card">
              <div className="value-number">50+</div>
              <div className="value-label">Corporate Clients</div>
            </div>
            <div className="value-card">
              <div className="value-number">100%</div>
              <div className="value-label">Satisfaction Rate</div>
            </div>
            <div className="value-card">
              <div className="value-number">24/7</div>
              <div className="value-label">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
