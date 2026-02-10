import Layout from '../components/Layout';

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
      description: 'Smart mobile solutions that bring India's digital future right to your fingertips.',
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
          background: white;
          color: #333;
          padding: 4rem 2rem;
          text-align: center;
          border-bottom: 2px solid #f0f0f0;
        }

        .solutions-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #667eea;
        }

        .solutions-hero p {
          font-size: 1.3rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
        }

        .container {
          max-width: 1200px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .intro-section {
          text-align: center;
          margin-bottom: 4rem;
        }

        .intro-section h2 {
          color: #667eea;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .intro-section p {
          font-size: 1.2rem;
          color: #666;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.8;
        }

        .solutions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }

        .solution-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          padding: 2.5rem;
          text-align: center;
        }

        .solution-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .solution-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .solution-card h3 {
          color: #667eea;
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        .solution-card p {
          color: #666;
          line-height: 1.8;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .solutions-hero h1 {
            font-size: 2.5rem;
          }

          .solutions-grid {
            grid-template-columns: 1fr;
          }

          .intro-section h2 {
            font-size: 2rem;
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
              <div className="solution-icon">{solution.icon}</div>
              <h3>{solution.title}</h3>
              <p>{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
