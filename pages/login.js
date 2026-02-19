import { useState } from 'react';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!supabase) {
        throw new Error('Database connection not configured');
      }

      // TODO: Implement login with Supabase Auth
      setMessage('Login functionality will be implemented with Supabase Auth');
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!supabase) {
        throw new Error('Database connection not configured');
      }

      // TODO: Implement magic link with Supabase Auth
      setMessage('Magic link sent! Please check your email.');
    } catch (error) {
      console.error('Magic link error:', error);
      setMessage('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!supabase) {
        throw new Error('Database connection not configured');
      }

      // TODO: Implement Google OAuth with Supabase Auth
      setMessage('Google sign-in will be implemented with Supabase Auth');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setMessage('Google sign-in failed. Please try again.');
    }
  };

  return (
    <Layout title="Login - iiskills.cloud">
      <style jsx>{`
        .login-container {
          max-width: 500px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .login-header h1 {
          font-size: 2.5rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .google-recommendation {
          background: #fff3cd;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #ffc107;
          color: #856404;
          line-height: 1.6;
        }

        .login-form {
          background: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 1rem;
        }

        .submit-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .magic-link-btn {
          width: 100%;
          padding: 0.75rem;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .magic-link-btn:hover {
          background: #f8f9ff;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .divider {
          text-align: center;
          margin: 2rem 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e0e0e0;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          position: relative;
          color: #999;
        }

        .google-signin-section {
          text-align: center;
        }

        .google-btn {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: white;
          color: #333;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .google-btn:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .register-link {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e0e0e0;
        }

        .register-link a {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }

        .register-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .login-form {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-header">
          <h1>Login to iiskills.cloud</h1>
        </div>

        <div className="google-recommendation">
          <strong>Recommendation:</strong> Though we have Google sign in, we suggest you register for a more streamlined experience.
        </div>

        {message && (
          <div className={`message ${message.includes('sent') || message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button
            type="button"
            className="magic-link-btn"
            onClick={handleMagicLink}
            disabled={loading || !formData.email || !/\S+@\S+\.\S+/.test(formData.email)}
          >
            Send Magic Link
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="google-signin-section">
            <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
              <span style={{ marginRight: '0.5rem' }}>🔐</span>
              Sign in with Google
            </button>
          </div>

          <div className="register-link">
            <p>Don't have an account? <a href="/register">Register here</a></p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
