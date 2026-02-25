import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getRandomImages } from '../lib/utils';

export default function About() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    setImages(getRandomImages(2));
  }, []);

  return (
    <Layout title="About Us - AI Cloud Enterprises">
      <style jsx>{`
        .about-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .about-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
          opacity: 0.3;
        }

        .about-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          font-weight: 800;
          position: relative;
          z-index: 1;
          letter-spacing: -1px;
        }

        .about-hero p {
          font-size: 1.4rem;
          max-width: 800px;
          margin: 0 auto;
          opacity: 0.95;
          position: relative;
          z-index: 1;
          font-weight: 500;
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 5rem 2rem;
        }

        .content-section {
          margin-bottom: 5rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          margin-top: 3rem;
          background: white;
          border-radius: 25px;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .content-image {
          width: 100%;
          height: 450px;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        h2 {
          font-size: 2.8rem;
          color: #667eea;
          margin-bottom: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        p {
          font-size: 1.15rem;
          line-height: 1.9;
          color: #555;
          margin-bottom: 1.5rem;
        }

        .values-section {
          text-align: center;
          margin-top: 5rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }

        .value-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          text-align: center;
          transition: all 0.4s ease;
          border: 1px solid rgba(102, 126, 234, 0.1);
          position: relative;
          overflow: hidden;
        }

        .value-card::before {
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

        .value-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.2);
        }

        .value-card:hover::before {
          transform: scaleX(1);
        }

        .value-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
        }

        .value-card h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.6rem;
          font-weight: 700;
        }

        .value-card p {
          font-size: 1.05rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem;
          }

          .about-hero {
            padding: 4rem 1.5rem;
          }

          .about-hero h1 {
            font-size: 2.5rem;
          }

          .about-hero p {
            font-size: 1.2rem;
          }

          h2 {
            font-size: 2.2rem;
          }

          .content-image {
            height: 300px;
          }

          .value-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="about-hero">
        <h1>About AI Cloud Enterprises</h1>
        <p>A corporate software company building AI-enabled platforms for India's public and private sectors</p>
      </div>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div>
              <h2>Our Mission</h2>
              <p>
                AI Cloud Enterprises designs, builds, and operates software platforms that create real impact
                for citizens, professionals, and institutions across India. We focus on sectors where digital
                access drives the most change — education, public services, and agriculture.
              </p>
              <p>
                Our platforms are built for scale, reliability, and inclusivity — supporting multiple Indian
                languages, low-bandwidth environments, and voice-first interfaces so that every user, regardless
                of location or literacy level, can benefit.
              </p>
            </div>
            {images[0] && (
              <img src={`/images/${images[0]}`} alt="Our Mission" className="content-image" />
            )}
          </div>
        </div>

        <div className="content-section">
          <div className="content-grid">
            {images[1] && (
              <img src={`/images/${images[1]}`} alt="Our Approach" className="content-image" />
            )}
            <div>
              <h2>Our Approach</h2>
              <p>
                We build products end-to-end — from architecture and design through to deployment and ongoing
                operations. Each platform is purpose-built for its audience, while sharing a common infrastructure
                for payments, authentication, and data security.
              </p>
              <p>
                We operate a shared payment gateway (aienter.in) that processes transactions securely on behalf
                of our product brands: IISkills, Jai Bharat, and Jai Kisan. All payments are handled via
                Razorpay with HMAC-signed handoffs and server-side verification.
              </p>
              <p>
                We keep our technology stack modern, maintainable, and auditable — ensuring that what we build
                today can be extended and trusted tomorrow.
              </p>
            </div>
          </div>
        </div>

        <div className="values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Purpose-Built</h3>
              <p>Every product we ship is designed for a specific, real-world need — not generic templates.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Security First</h3>
              <p>We build with privacy and security as requirements, not afterthoughts.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌐</div>
              <h3>Inclusive by Design</h3>
              <p>Our platforms support regional languages and voice interfaces to reach every Indian.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">⚙️</div>
              <h3>Reliable Operations</h3>
              <p>We take operational excellence seriously — fast, available, and maintainable.</p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
