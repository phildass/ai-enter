import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  const freeCourses = [
    { name: 'Learn Chemistry', id: 'learn-chemistry' },
    { name: 'Learn Geography', id: 'learn-geography' },
    { name: 'Learn Math', id: 'learn-math' },
    { name: 'Learn Physics', id: 'learn-physics' },
    { name: 'Learn Apt', id: 'learn-apt' }
  ];

  const paidCourses = [
    { name: 'Learn PR', id: 'learn-pr' },
    { name: 'Learn AI', id: 'learn-ai' },
    { name: 'Learn Management', id: 'learn-management' },
    { name: 'Learn Developer', id: 'learn-developer' }
  ];

  return (
    <Layout title="AI Cloud Enterprises - Transform Your Future with AI">
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('/images/iiskills-aienter-hero2.jpg');
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
          color: #667eea;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero p {
          font-size: 1.5rem;
          margin-bottom: 2.5rem;
          color: #667eea;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
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

        .courses-section {
          background: #f8f9ff;
          padding: 4rem 2rem;
        }

        .courses-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .courses-header h2 {
          font-size: 2.5rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .courses-header p {
          font-size: 1.3rem;
          color: #666;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .course-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          text-align: center;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .course-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .free-badge {
          background: #d4edda;
          color: #155724;
        }

        .paid-badge {
          background: #fff3cd;
          color: #856404;
        }

        .course-name {
          font-size: 1.3rem;
          color: #333;
          font-weight: 600;
        }

        .combo-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          margin: 2rem auto;
          max-width: 800px;
        }

        .combo-highlight h3 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .combo-highlight p {
          font-size: 1.2rem;
          opacity: 0.95;
        }

        .quote-section {
          background: white;
          padding: 3rem 2rem;
          text-align: center;
          border-top: 3px solid #667eea;
          border-bottom: 3px solid #667eea;
        }

        .quote {
          font-size: 1.8rem;
          color: #667eea;
          font-style: italic;
          max-width: 900px;
          margin: 0 auto;
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

          .courses-grid {
            grid-template-columns: 1fr;
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

      <div className="quote-section">
        <p className="quote">"Education is a right, not a luxury. No barriers. Just Mastery."</p>
      </div>

      <div className="courses-section">
        <div className="courses-header">
          <h2>Available Courses</h2>
          <p>Courses available now: 9 | Five Free | Four Paid</p>
        </div>

        <div className="courses-grid">
          {freeCourses.map((course) => (
            <div key={course.id} className="course-card">
              <span className="course-badge free-badge">FREE</span>
              <h3 className="course-name">{course.name}</h3>
            </div>
          ))}
        </div>

        <div className="courses-grid">
          {paidCourses.map((course) => (
            <div key={course.id} className="course-card">
              <span className="course-badge paid-badge">PAID</span>
              <h3 className="course-name">{course.name}</h3>
            </div>
          ))}
        </div>

        <div className="combo-highlight">
          <h3>🎁 Special Combo Offer!</h3>
          <p>Get Learn AI + Learn Developer for the price of one!</p>
          <p style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Rs 99 + GST = Rs 116.82
          </p>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">AI Cloud Enterprises: Services that touch every Indian.</h2>
      </div>
    </Layout>
  );
}
