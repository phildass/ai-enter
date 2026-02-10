import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'AI Enter - Smart SaaS Solutions' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="AI Cloud Enterprises - Smart SaaS Solutions for the Future" />
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

        a {
          text-decoration: none;
        }
      `}</style>

      <style jsx>{`
        header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-image {
          height: 40px;
          width: auto;
        }
        
        nav h1 {
          font-size: 1.8rem;
          cursor: pointer;
        }
        
        nav ul {
          list-style: none;
          display: flex;
          gap: 2rem;
        }
        
        nav :global(a) {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.3s;
          padding: 0.5rem 1rem;
          border-radius: 5px;
        }
        
        nav :global(a:hover) {
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.1);
        }
        
        footer {
          background: #333;
          color: white;
          text-align: center;
          padding: 2rem;
          margin-top: 4rem;
        }

        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            gap: 1rem;
          }

          nav ul {
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
          }
        }
      `}</style>

      <header>
        <nav>
          <Link href="/">
            <div className="logo-container">
              <img src="/images/ai-cloud.png" alt="AI Cloud" className="logo-image" />
              <h1>AI Enter</h1>
            </div>
          </Link>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/enroll">Enroll</Link></li>
            <li><Link href="/payment">Payment</Link></li>
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
