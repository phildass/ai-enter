import Layout from '../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCourseById } from '../lib/courses';

export default function Success() {
  const router = useRouter();
  const { course: courseId } = router.query;
  const course = courseId ? getCourseById(courseId) : null;

  return (
    <Layout title="Payment Successful - AI Cloud Enterprises">
      <style jsx>{`
        .container {
          max-width: 700px;
          margin: 4rem auto;
          padding: 0 2rem;
        }
        
        .success-card {
          background: white;
          border-radius: 15px;
          padding: 4rem 3rem;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .success-icon {
          font-size: 5rem;
          margin-bottom: 2rem;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        h2 {
          color: #667eea;
          margin-bottom: 1.5rem;
          font-size: 2.5rem;
        }
        
        p {
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.8;
          font-size: 1.1rem;
        }
        
        .course-name {
          font-weight: bold;
          color: #667eea;
          font-size: 1.2rem;
        }
        
        .button-group {
          display: flex;
          gap: 1.5rem;
          margin-top: 3rem;
          justify-content: center;
        }
        
        .btn {
          flex: 1;
          max-width: 200px;
          display: inline-block;
          padding: 1.2rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }
        
        .primary-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .secondary-button {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .info-box {
          background: #f8f9ff;
          padding: 2rem;
          border-radius: 10px;
          margin-top: 2rem;
          border-left: 4px solid #667eea;
        }

        .info-box h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .info-box ul {
          list-style: none;
          text-align: left;
          color: #555;
        }

        .info-box li {
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
        }

        .info-box li::before {
          content: "✓";
          color: #667eea;
          font-weight: bold;
          margin-right: 0.8rem;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .button-group {
            flex-direction: column;
            align-items: stretch;
          }

          .btn {
            max-width: none;
          }

          .success-card {
            padding: 3rem 2rem;
          }

          h2 {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Enrollment Successful!</h2>
          {course ? (
            <p>
              Congratulations! You have successfully enrolled in{' '}
              <span className="course-name">{course.name}</span>.
            </p>
          ) : (
            <p>
              Thank you for your enrollment!
            </p>
          )}

          <div className="info-box">
            <h3>What's Next?</h3>
            <ul>
              <li>Check your email for enrollment confirmation</li>
              <li>You'll receive course access details within 24 hours</li>
              <li>Our support team will contact you shortly</li>
              <li>Start preparing for an amazing learning journey!</li>
            </ul>
          </div>
          
          <div className="button-group">
            <Link href="/payment" className="btn secondary-button">
              Browse Courses
            </Link>
            <Link href="/" className="btn primary-button">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
