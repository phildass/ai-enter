import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getRandomImages } from '../lib/utils';

export default function Solutions() {
  const [solutionImages, setSolutionImages] = useState([]);

  useEffect(() => {
    setSolutionImages(getRandomImages(6));
  }, []);

  const solutions = [
    {
      title: 'Learn AI',
      description: 'Master artificial intelligence and machine learning to transform your career in the AI era.',
      icon: '🤖',
      benefits: [
        'AI fundamentals and applications',
        'Machine learning techniques',
        'Real-world AI projects',
        'Industry-recognized certification'
      ]
    },
    {
      title: 'Learn PR',
      description: 'Master public relations and corporate communications for the digital age.',
      icon: '📢',
      benefits: [
        'Strategic PR planning',
        'Media relations expertise',
        'Crisis management',
        'Digital communication strategies'
      ]
    },
    {
      title: 'Learn Management',
      description: 'Develop essential leadership and management skills for modern organizations.',
      icon: '👔',
      benefits: [
        'Strategic management principles',
        'Team leadership',
        'Project management',
        'Decision-making frameworks'
      ]
    },
    {
      title: 'Learn Finesse',
      description: 'Master professional etiquette and interpersonal skills for career success.',
      icon: '✨',
      benefits: [
        'Professional communication',
        'Business etiquette',
        'Networking excellence',
        'Personal branding'
      ]
    },
    {
      title: 'Learn Govt Jobs',
      description: 'Comprehensive preparation for government job examinations and interviews.',
      icon: '🏛️',
      benefits: [
        'Exam preparation strategies',
        'Mock tests and assessments',
        'Interview preparation',
        'Current affairs mastery'
      ]
    },
    {
      title: 'Learn Developer',
      description: 'Build professional software development skills from fundamentals to advanced.',
      icon: '💻',
      benefits: [
        'Full-stack development',
        'Modern frameworks',
        'Best practices',
        'Portfolio projects'
      ]
    }
  ];

  return (
    <Layout title="Solutions - AI Cloud Enterprises">
      <style jsx>{`
        .solutions-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .solutions-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .solutions-hero p {
          font-size: 1.3rem;
          opacity: 0.95;
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
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2.5rem;
          margin-top: 3rem;
        }

        .solution-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .solution-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .solution-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .solution-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .solution-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .solution-header h3 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        .solution-body {
          padding: 2rem;
        }

        .solution-body p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .benefits-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .benefits-list li {
          padding: 0.7rem 0;
          color: #666;
          display: flex;
          align-items: center;
        }

        .benefits-list li:before {
          content: "✓";
          color: #667eea;
          font-weight: bold;
          margin-right: 0.8rem;
          font-size: 1.2rem;
        }

        .cta-section {
          background: #f8f9ff;
          padding: 4rem 2rem;
          margin-top: 4rem;
          border-radius: 15px;
          text-align: center;
        }

        .cta-section h2 {
          color: #667eea;
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .special-offer {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          margin: 2rem auto;
          max-width: 600px;
          border: 2px solid #667eea;
        }

        .special-offer h3 {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .special-offer p {
          color: #666;
          margin: 0;
        }

        .cta-button {
          display: inline-block;
          padding: 1.2rem 3rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1.2rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
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
        <p>Comprehensive courses designed to empower your career and transform your professional journey</p>
      </div>

      <div className="container">
        <div className="intro-section">
          <h2>Choose Your Path to Success</h2>
          <p>
            AI Cloud Enterprises offers six specialized courses, each designed to provide you with industry-relevant 
            skills and knowledge. Whether you're looking to enter the AI field, advance in management, prepare for 
            government jobs, or master professional skills, we have the perfect solution for you.
          </p>
        </div>

        <div className="solutions-grid">
          {solutions.map((solution, index) => (
            <div key={index} className="solution-card">
              {solutionImages[index] && (
                <img 
                  src={`/images/${solutionImages[index]}`} 
                  alt={solution.title} 
                  className="solution-image" 
                />
              )}
              <div className="solution-header">
                <div className="solution-icon">{solution.icon}</div>
                <h3>{solution.title}</h3>
              </div>
              <div className="solution-body">
                <p>{solution.description}</p>
                <ul className="benefits-list">
                  {solution.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>All courses are available at the same affordable price</p>
          
          <div className="special-offer">
            <h3>🎁 Special Combo Offer!</h3>
            <p>
              <strong>Learn AI + Learn Developer</strong> bundle available at the same price as Learn AI alone. 
              Get double the value with our exclusive combo offer!
            </p>
          </div>

          <Link href="/payment" className="cta-button">
            Enroll Now
          </Link>
        </div>
      </div>
    </Layout>
  );
}
