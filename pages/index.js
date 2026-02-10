import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getRandomImages } from '../lib/utils';

export default function Home() {
  const [featureImages, setFeatureImages] = useState([]);

  useEffect(() => {
    setFeatureImages(getRandomImages(3));
  }, []);

  return (
    <Layout title="AI Cloud Enterprises - Transform Your Future with AI">
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%),
                      url('/images/aienter-rm90-hero.jpg');
          background-size: cover;
          background-position: center;
          color: white;
          text-align: center;
          padding: 4rem 2rem;
        }

        .hero-content {
          max-width: 900px;
          z-index: 1;
        }

        .hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero p {
          font-size: 1.5rem;
          margin-bottom: 2.5rem;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          display: inline-block;
          padding: 1.2rem 3rem;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .cta-primary {
          background: white;
          color: #667eea;
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .cta-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          color: #667eea;
          margin-bottom: 3rem;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .feature-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .feature-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }

        .feature-card p {
          color: #666;
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .stats-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          margin: 4rem 0;
        }

        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat-item h4 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .stat-item p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .hero p {
            font-size: 1.2rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="hero">
        <div className="hero-content">
          <h1>AI Cloud Enterprises</h1>
          <p>Empowering professionals with cutting-edge AI and cloud technologies for career excellence</p>
          <div className="cta-buttons">
            <Link href="/payment" className="cta-button cta-primary">
              Enroll Now
            </Link>
            <Link href="/solutions" className="cta-button cta-secondary">
              View Solutions
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Why Choose AI Cloud Enterprises?</h2>
        <div className="features">
          <div className="feature-card">
            {featureImages[0] && (
              <img src={`/images/${featureImages[0]}`} alt="Expert Training" className="feature-image" />
            )}
            <div className="feature-icon">🎓</div>
            <h3>Expert Training</h3>
            <p>Learn from industry professionals with years of real-world experience in AI and cloud technologies.</p>
          </div>
          <div className="feature-card">
            {featureImages[1] && (
              <img src={`/images/${featureImages[1]}`} alt="Practical Learning" className="feature-image" />
            )}
            <div className="feature-icon">💼</div>
            <h3>Practical Learning</h3>
            <p>Work on real-world projects and build a portfolio that showcases your skills to potential employers.</p>
          </div>
          <div className="feature-card">
            {featureImages[2] && (
              <img src={`/images/${featureImages[2]}`} alt="Career Support" className="feature-image" />
            )}
            <div className="feature-icon">🚀</div>
            <h3>Career Support</h3>
            <p>Get job placement assistance and career guidance to help you land your dream role in tech.</p>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h4>1000+</h4>
            <p>Students Enrolled</p>
          </div>
          <div className="stat-item">
            <h4>95%</h4>
            <p>Placement Rate</p>
          </div>
          <div className="stat-item">
            <h4>50+</h4>
            <p>Industry Partners</p>
          </div>
          <div className="stat-item">
            <h4>4.8★</h4>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Ready to Start Your Journey?</h2>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/payment" className="cta-button cta-primary">
            View Our Courses
          </Link>
        </div>
      </div>
    </Layout>
  );
}
