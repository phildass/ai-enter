import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { courses, getCurrentFee } from '../lib/courses';
import { getRandomImages } from '../lib/utils';

export default function Enroll() {
  const [courseImages, setCourseImages] = useState([]);
  const [feeInfo, setFeeInfo] = useState(null);

  useEffect(() => {
    setCourseImages(getRandomImages(courses.length));
    setFeeInfo(getCurrentFee());
  }, []);

  return (
    <Layout title="Enroll - AI Enter">
      <style jsx>{`
        .enroll-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .enroll-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .enroll-hero p {
          font-size: 1.3rem;
          opacity: 0.95;
        }

        .container {
          max-width: 1200px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .pricing-banner {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-bottom: 3rem;
          border-left: 5px solid #667eea;
        }

        .pricing-banner h2 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }

        .pricing-details {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .pricing-note {
          color: #666;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .price-highlight {
          color: #667eea;
          font-weight: bold;
          font-size: 2rem;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        .course-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .course-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .course-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .course-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
        }

        .course-header h3 {
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
        }

        .course-header p {
          opacity: 0.95;
          font-size: 1rem;
        }

        .course-body {
          padding: 2rem;
        }

        .features-list {
          list-style: none;
          margin: 1.5rem 0;
        }

        .features-list li {
          padding: 0.7rem 0;
          color: #666;
          font-size: 1rem;
          display: flex;
          align-items: center;
        }

        .features-list li:before {
          content: "✓";
          color: #667eea;
          font-weight: bold;
          margin-right: 0.8rem;
          font-size: 1.2rem;
        }

        .enroll-button {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .enroll-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .course-footer {
          padding: 0 2rem 2rem 2rem;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .enroll-hero h1 {
            font-size: 2.5rem;
          }

          .courses-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="enroll-hero">
        <h1>Choose Your Course</h1>
        <p>All courses come with the same affordable pricing and premium features</p>
      </div>

      <div className="container">
        {feeInfo && (
          <div className="pricing-banner">
            <h2>{feeInfo.period}</h2>
            <div className="pricing-details">
              Course Fee: <span className="price-highlight">₹{feeInfo.displayTotal}</span>
            </div>
            <div className="pricing-note">
              (Base: ₹{feeInfo.displayBase} + GST @ 18%: ₹{feeInfo.displayGst})
            </div>
            <div className="pricing-note">
              {feeInfo.period.includes('Early Bird') 
                ? '⏰ Limited time offer! Price increases to ₹352.82 from March 1, 2026'
                : '💰 Same great quality education, same price for all courses'}
            </div>
          </div>
        )}

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={course.id} className="course-card">
              {courseImages[index] && (
                <img 
                  src={`/images/${courseImages[index]}`} 
                  alt={course.name} 
                  className="course-image" 
                />
              )}
              <div className="course-header">
                <h3>{course.name}</h3>
                <p>{course.description}</p>
              </div>
              <div className="course-body">
                <ul className="features-list">
                  {course.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <Link href={`/payment?course=${course.id}`} className="enroll-button">
                  Enroll Now
                </Link>
              </div>
              <div className="course-footer">
                {feeInfo && `₹${feeInfo.displayTotal} (incl. GST)`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
