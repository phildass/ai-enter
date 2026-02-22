import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'AI Cloud Enterprises - Smart SaaS Solutions' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="AI Cloud Enterprises - Smart SaaS Solutions for the Future" />
        <link rel="icon" type="image/png" href="/images/aienter-favicon.png" />
        <link rel="apple-touch-icon" href="/images/aienter-favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f8f9ff;
        }

        a {
          text-decoration: none;
        }
      `}</style>

      <style jsx>{`
        header {
          background: white;
          color: #333;
          padding: 1rem 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        nav {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 3rem;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 0.5rem;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        .logo-container:hover {
          transform: translateY(-2px);
        }

        .logo-image {
          height: 50px;
          width: auto;
        }
        
        nav h1 {
          font-size: 1.5rem;
          cursor: pointer;
          color: #667eea;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        nav ul {
          list-style: none;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        nav :global(a) {
          color: #555;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 0.7rem 1.2rem;
          border-radius: 8px;
          font-size: 0.95rem;
        }
        
        nav :global(a:hover) {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }
        
        footer {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          text-align: center;
          padding: 3rem 2rem;
          margin-top: 6rem;
          border-top: 4px solid #667eea;
        }

        footer p {
          opacity: 0.9;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            gap: 1.5rem;
            padding: 1rem 1.5rem;
          }

          nav ul {
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
          }

          nav :global(a) {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <header>
        <nav>
          <Link href="/">
            <div className="logo-container">
              <img src="/images/ai-cloud.png" alt="AI Cloud Enterprises" className="logo-image" />
              <h1>AI Cloud Enterprises</h1>
            </div>
          </Link>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/payments">Payment</Link></li>
            <li><Link href="/register">Register</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms & Conditions</Link></li>
          </ul>
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <p>&copy; 2026 AI Cloud Enterprises. All rights reserved.</p>
      </footer>
    </>
  );
}
