import Layout from '../components/Layout';
import Link from 'next/link';

export default function Solutions() {
  const solutions = [
    {
      title: 'Sector Focus',
      description: 'From healthcare to education, our apps are precisely tailored to address the unique challenges of each industry. We empower organizations to thrive in the digital era—delivering seamless, effective solutions for businesses of every sector.',
      icon: '🎯',
    },
    {
      title: 'Scalable Solutions',
      description: 'Our subscription-based platforms grow with your business, ensuring seamless digital experiences for both mass and niche audiences.',
      icon: '📈',
    },
    {
      title: 'Mobile Apps',
      description: 'Smart mobile solutions that bring India\'s digital future right to your fingertips.',
      icon: '📱',
    },
    {
      title: 'Web Apps',
      description: 'Robust, scalable web applications designed for broad and niche audiences alike.',
      icon: '💻',
    }
  ];

  return (
    <Layout title="Solutions - AI Cloud Enterprises">
      <style jsx>{`
        .solutions-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .solutions-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
          opacity: 0.3;
        }

        .solutions-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          font-weight: 800;
          position: relative;
          z-index: 1;
          letter-spacing: -1px;
        }

        .solutions-hero p {
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
          margin: 5rem auto;
          padding: 0 2rem;
        }

        .intro-section {
          text-align: center;
          margin-bottom: 5rem;
          background: white;
          border-radius: 25px;
          padding: 4rem 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .intro-section h2 {
          color: #667eea;
          font-size: 2.8rem;
          margin-bottom: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .intro-section p {
          font-size: 1.25rem;
          color: #666;
          max-width: 900px;
          margin: 0 auto;
          line-height: 1.9;
        }

        .solutions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 3rem;
          margin-top: 3rem;
        }

        .solution-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          padding: 3rem;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.1);
          position: relative;
        }

        .solution-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .solution-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(102, 126, 234, 0.25);
        }

        .solution-card:hover::before {
          transform: scaleX(1);
        }

        .solution-icon {
          font-size: 4.5rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .solution-card h3 {
          color: #667eea;
          font-size: 2rem;
          margin-bottom: 1.2rem;
          font-weight: 700;
        }

        .solution-card p {
          color: #666;
          line-height: 1.9;
          font-size: 1.1rem;
        }

        .cta-section {
          text-align: center;
          margin-top: 5rem;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          border-radius: 25px;
          border: 2px solid rgba(102, 126, 234, 0.1);
        }

        .cta-section h2 {
          color: #667eea;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          font-weight: 800;
        }

        .cta-section p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .btn {
          display: inline-block;
          padding: 1.2rem 3rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
        }

        @media (max-width: 768px) {
          .solutions-hero {
            padding: 4rem 1.5rem;
          }

          .solutions-hero h1 {
            font-size: 2.5rem;
          }

          .solutions-hero p {
            font-size: 1.2rem;
          }

          .solutions-grid {
            grid-template-columns: 1fr;
          }

          .intro-section {
            padding: 2.5rem 2rem;
          }

          .intro-section h2 {
            font-size: 2.2rem;
          }

          .solution-card {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="solutions-hero">
        <h1>Our Solutions</h1>
        <p>Comprehensive SaaS-based solutions designed to empower your business and transform your digital journey</p>
      </div>

      <div className="container">
        <div className="intro-section">
          <h2>Corporate Solutions for Every Industry</h2>
          <p>
            AI Cloud Enterprises delivers cutting-edge SaaS solutions for businesses across India. 
            Our platforms are designed to scale with your organization, providing robust tools for 
            education, automation, and digital transformation.
          </p>
        </div>

        <div className="solutions-grid">
          {solutions.map((solution, index) => (
            <div key={index} className="solution-card">
              <span className="solution-icon">{solution.icon}</span>
              <h3>{solution.title}</h3>
              <p>{solution.description}</p>
            </div>
          ))}
        </div>

        <div className="cta-section">
          <h2>Ready to Transform Your Business?</h2>
          <p>Let's discuss how our solutions can help you achieve your goals</p>
          <Link href="/contact" className="btn">
            Get Started Today
          </Link>
        </div>
      </div>
    </Layout>
  );
}
