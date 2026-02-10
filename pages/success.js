import Head from 'next/head';
import { useRouter } from 'next/router';
import { getCourseById } from '../lib/courses';

export default function Success() {
  const router = useRouter();
  const { course: courseId } = router.query;
  const course = courseId ? getCourseById(courseId) : null;

  return (
    <>
      <Head>
        <title>Payment Successful - AI Enter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
      `}</style>

      <style jsx>{`
        header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }
        
        nav h1 {
          font-size: 1.8rem;
        }
        
        nav ul {
          list-style: none;
          display: flex;
          gap: 2rem;
        }
        
        nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.3s;
        }
        
        nav a:hover {
          opacity: 0.8;
        }
        
        .container {
          max-width: 600px;
          margin: 4rem auto;
          padding: 0 2rem;
        }
        
        .success-card {
          background: white;
          border-radius: 10px;
          padding: 3rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        h2 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 2rem;
        }
        
        p {
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.8;
        }
        
        .course-name {
          font-weight: bold;
          color: #667eea;
        }
        
        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        a {
          flex: 1;
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: opacity 0.3s;
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
        
        a:hover {
          opacity: 0.9;
        }
        
        footer {
          background: #333;
          color: white;
          text-align: center;
          padding: 2rem;
          margin-top: 4rem;
        }
      `}</style>

      <header>
        <nav>
          <h1>AI Enter</h1>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/courses.html">Courses</a></li>
            <li><a href="/payments">Payments</a></li>
          </ul>
        </nav>
      </header>

      <div className="container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          {course ? (
            <p>
              Congratulations! You have successfully enrolled in{' '}
              <span className="course-name">{course.name}</span>.
              <br /><br />
              You will receive an email with access details shortly.
            </p>
          ) : (
            <p>
              Thank you for your purchase! You will receive a confirmation email shortly.
            </p>
          )}
          
          <div className="button-group">
            <a href="/courses.html" className="secondary-button">
              Browse More Courses
            </a>
            <a href="/" className="primary-button">
              Back to Home
            </a>
          </div>
        </div>
      </div>

      <footer>
        <p>&copy; 2026 AI Enter. All rights reserved.</p>
      </footer>
    </>
  );
}
