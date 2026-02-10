import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="AI Cloud Enterprises - Transform Your Future with AI">
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('/images/aienter-rm90-hero.jpg');
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

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .hero p {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="hero">
        <div className="hero-content">
          <h1>AI Cloud Enterprises</h1>
          <p>Smart SaaS Solutions for India's Digital Future</p>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Why Choose AI Cloud Enterprises?</h2>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
          At AI Cloud Enterprises we offer Skill Enhancement Courses through iiskills.cloud. There are foundational free courses and premium paid courses—all available at very reasonable prices that every Indian can afford.
        </p>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666', lineHeight: '1.8', maxWidth: '900px', margin: '0 auto' }}>
          AI Cloud Enterprises also delivers SaaS-based solutions for scalable training, development, and app creation across universal uses and industries. Our expertise covers the development of education platforms, business automation apps, and digital transformation tools for organizations nationwide.
        </p>
      </div>



      <div className="container">
        <h2 className="section-title">AI Cloud Enterprises: Services that touch every Indian.</h2>
      </div>
    </Layout>
  );
}
