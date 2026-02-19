import { useState } from 'react';
import Layout from '../components/Layout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this to an API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout title="Contact Us - AI Cloud Enterprises">
      <style jsx>{`
        .contact-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .contact-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
          opacity: 0.3;
        }

        .contact-hero h1 {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          font-weight: 800;
          position: relative;
          z-index: 1;
          letter-spacing: -1px;
        }

        .contact-hero p {
          font-size: 1.4rem;
          opacity: 0.95;
          position: relative;
          z-index: 1;
          font-weight: 500;
        }

        .container {
          max-width: 900px;
          margin: 5rem auto;
          padding: 0 2rem;
        }

        .contact-info {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          text-align: center;
          margin-bottom: 3rem;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .contact-info h2 {
          color: #667eea;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .contact-info p {
          color: #666;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .contact-form {
          background: white;
          padding: 4rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .contact-form h2 {
          color: #667eea;
          margin-bottom: 2.5rem;
          font-size: 2.2rem;
          font-weight: 800;
          text-align: center;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        label {
          display: block;
          margin-bottom: 0.7rem;
          font-weight: 600;
          color: #555;
          font-size: 1rem;
        }

        input, textarea {
          width: 100%;
          padding: 1.2rem;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: #f8f9ff;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
        }

        textarea {
          resize: vertical;
          min-height: 180px;
        }

        button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.3rem;
          border: none;
          border-radius: 12px;
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
        }

        .success-message {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 2px solid #b1dfbb;
          text-align: center;
          font-weight: 600;
          font-size: 1.05rem;
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 4rem 1.5rem;
          }

          .contact-hero h1 {
            font-size: 2.5rem;
          }

          .contact-hero p {
            font-size: 1.2rem;
          }

          .contact-form {
            padding: 2.5rem 2rem;
          }

          .contact-info {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="contact-hero">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you. Reach out to us for any questions or inquiries.</p>
      </div>

      <div className="container">
        <div className="contact-info">
          <h2>Contact Email</h2>
          <p>support@aienter.in</p>
        </div>

        <div className="contact-form">
          <h2>Send Us a Message</h2>
            
            {submitted && (
              <div className="success-message" role="alert">
                <span aria-label="Success">✓</span> Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you?"
                />
              </div>

              <button type="submit">Send Message</button>
            </form>
        </div>
      </div>
    </Layout>
  );
}
