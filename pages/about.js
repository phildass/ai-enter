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
        <p>A corporate software company building platforms for public and private use across India</p>
      </div>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div>
              <h2>Our Mission</h2>
              <p>
                AI Cloud Enterprises designs, builds, and operates software platforms that serve real needs — from professional learning and government job preparation to agricultural assistance for farmers across India.
              </p>
              <p>
                We focus on purposeful product engineering: each platform is built for a specific audience, in appropriate languages, with the infrastructure and security required for reliable production use.
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
                We build and maintain focused SaaS products under distinct brands — IISkills, Jai Bharat, and Jai Kisan — each solving a well-defined problem for a distinct user base.
              </p>
              <p>
                Shared infrastructure, including a common payment gateway, reduces integration overhead while keeping each product experience clean and brand-appropriate.
              </p>
              <p>
                We prioritize reliability, security, and accessibility — including multi-language and voice-first interfaces for users in rural and semi-urban India.
              </p>
            </div>
          </div>
        </div>

        <div className="values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Focus</h3>
              <p>Each product serves a specific need. We avoid building generic platforms that serve no one well.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Trust</h3>
              <p>Payments, data, and integrations are built with security and verifiability at their core.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌐</div>
              <h3>Accessibility</h3>
              <p>We design for India's diversity — multiple languages, varying connectivity, and a wide range of devices.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">⚙️</div>
              <h3>Reliability</h3>
              <p>Production-grade infrastructure with monitoring, clear APIs, and defined SLAs for partner integrations.</p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
