import { useState } from 'react';
import Layout from '../components/Layout';
import supabase from '../lib/supabase';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    stage: '',
    fatherOccupation: '',
    motherOccupation: '',
    locationName: '',
    taluk: '',
    district: '',
    state: '',
    locationOther: '',
    phone: '',
    purpose: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

      // TODO: Implement user registration with Supabase Auth
      // For now, just show success message
      setMessage('Registration successful! Please check your email for verification.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        age: '',
        stage: '',
        fatherOccupation: '',
        motherOccupation: '',
        locationName: '',
        taluk: '',
        district: '',
        state: '',
        locationOther: '',
        phone: '',
        purpose: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Register - iiskills.cloud">
      <style jsx>{`
        .register-container {
          max-width: 800px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .register-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .register-header h1 {
          font-size: 2.5rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .register-note {
          background: #f8f9ff;
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          line-height: 1.6;
          color: #666;
        }

        .google-recommendation {
          background: #fff3cd;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #ffc107;
          color: #856404;
        }

        .register-form {
          background: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
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

        input,
        select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        input:focus,
        select:focus {
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

        .google-signin-section {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e0e0e0;
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

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .register-form {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="register-header">
          <h1>Register for iiskills.cloud</h1>
        </div>

        <div className="register-note">
          <strong>Note:</strong> We request you to use your real name if you wish to take certification courses.
        </div>

        <div className="google-recommendation">
          <strong>Recommendation:</strong> Though we have Google sign in, we suggest you register here for a more streamlined experience.
        </div>

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stage">Stage *</label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              required
            >
              <option value="">Select Stage</option>
              <option value="Student">Student</option>
              <option value="Employed">Employed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fatherOccupation">Father's Occupation</label>
              <input
                type="text"
                id="fatherOccupation"
                name="fatherOccupation"
                value={formData.fatherOccupation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="motherOccupation">Mother's Occupation</label>
              <input
                type="text"
                id="motherOccupation"
                name="motherOccupation"
                value={formData.motherOccupation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="locationName">Name of your location</label>
            <input
              type="text"
              id="locationName"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              placeholder="Enter your location name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="taluk">Taluk (India)</label>
            <input
              type="text"
              id="taluk"
              name="taluk"
              value={formData.taluk}
              onChange={handleChange}
              placeholder="Enter your taluk"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="district">District (India)</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter your district"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State (India)</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter your state"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="locationOther">Location Other</label>
            <input
              type="text"
              id="locationOther"
              name="locationOther"
              value={formData.locationOther}
              onChange={handleChange}
              placeholder="If outside India, enter location here"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              placeholder="10-digit phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose *</label>
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            >
              <option value="">Select Purpose</option>
              <option value="Just Browsing">Just Browsing</option>
              <option value="Intend to take a course">Intend to take a course</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="google-signin-section">
            <p style={{ marginBottom: '1rem', color: '#666' }}>Or sign in with:</p>
            <button type="button" className="google-btn">
              <span style={{ marginRight: '0.5rem' }}>🔐</span>
              Sign in with Google
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
