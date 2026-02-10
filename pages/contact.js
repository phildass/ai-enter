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
          padding: 4rem 2rem;
          text-align: center;
        }

        .contact-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .contact-hero p {
          font-size: 1.3rem;
          opacity: 0.95;
        }

        .container {
          max-width: 1200px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .contact-info {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-bottom: 2rem;
        }

        .contact-info h2 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .contact-info p {
          color: #666;
          font-size: 1.1rem;
        }

        .contact-form {
          background: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .contact-form h2 {
          color: #667eea;
          margin-bottom: 2rem;
          font-size: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
        }

        input, textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        textarea {
          resize: vertical;
          min-height: 150px;
        }

        button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #c3e6cb;
          text-align: center;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .contact-hero h1 {
            font-size: 2.5rem;
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
          <h2>Contact Us</h2>
            
            {submitted && (
              <div className="success-message">
                Thank you! Your message has been sent successfully.
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
