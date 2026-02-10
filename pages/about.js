import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

function getRandomImages(count = 2) {
  const allImages = [
    'aienter-rm2.jpg',
    'aienter-rm3.jpg',
    'aienter-rm4.jpg',
    'aienter-rm5.jpg',
    'aienter-rm7.jpg',
    'aienter-rm8.jpg',
    'aienter-rm9.jpg',
    'aienter-rm10.jpg',
    'aienter-rm11.jpg'
  ];
  
  const shuffled = [...allImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function About() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    setImages(getRandomImages(2));
  }, []);

  return (
    <Layout title="About Us - AI Enter">
      <style jsx>{`
        .about-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .about-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .about-hero p {
          font-size: 1.3rem;
          max-width: 800px;
          margin: 0 auto;
          opacity: 0.95;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .content-section {
          margin-bottom: 4rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          margin-top: 2rem;
        }

        .content-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        h2 {
          font-size: 2.5rem;
          color: #667eea;
          margin-bottom: 1.5rem;
        }

        p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 1.5rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .value-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .value-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .value-card h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .value-card p {
          font-size: 1rem;
        }

        .cta-section {
          background: #f8f9ff;
          padding: 3rem;
          border-radius: 15px;
          text-align: center;
          margin-top: 3rem;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.2rem 3rem;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .about-hero h1 {
            font-size: 2.5rem;
          }

          h2 {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="about-hero">
        <h1>About AI Cloud Enterprises</h1>
        <p>Leading the way in AI education and cloud solutions for a smarter tomorrow</p>
      </div>

      <div className="container">
        <div className="content-section">
          <div className="content-grid">
            <div>
              <h2>Our Mission</h2>
              <p>
                At AI Cloud Enterprises, we're committed to democratizing access to cutting-edge AI and cloud 
                technologies. We believe that everyone should have the opportunity to learn, grow, and excel 
                in the rapidly evolving tech landscape.
              </p>
              <p>
                Our courses are designed by industry experts who bring real-world experience into the classroom. 
                We focus on practical, hands-on learning that prepares our students for successful careers in 
                AI, machine learning, cloud computing, and data science.
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
                We combine theoretical knowledge with practical application, ensuring that our students not 
                only understand concepts but can also implement them in real-world scenarios.
              </p>
              <p>
                Through project-based learning, mentorship programs, and industry partnerships, we create a 
                comprehensive learning ecosystem that supports our students from enrollment to career placement.
              </p>
              <p>
                Our curriculum is constantly updated to reflect the latest industry trends and technologies, 
                ensuring that our graduates are always ahead of the curve.
              </p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 style={{ textAlign: 'center' }}>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Excellence</h3>
              <p>We strive for excellence in everything we do, from course content to student support.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Collaboration</h3>
              <p>We believe in the power of community and collaborative learning.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Innovation</h3>
              <p>We continuously innovate our teaching methods and course offerings.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌟</div>
              <h3>Impact</h3>
              <p>We measure our success by the impact we create in our students' lives.</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Join Us?</h2>
          <p>Start your journey towards a successful career in AI and cloud technologies today.</p>
          <Link href="/enroll" className="cta-button">
            Explore Our Courses
          </Link>
        </div>
      </div>
    </Layout>
  );
}
