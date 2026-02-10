import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { courses, getCourseById, getCurrentFee } from '../lib/courses';

export default function Payment() {
  const router = useRouter();
  const { course: courseParam } = router.query;
  
  const [selectedCourse, setSelectedCourse] = useState(courseParam || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feeInfo, setFeeInfo] = useState(null);

  useEffect(() => {
    setFeeInfo(getCurrentFee());
  }, []);

  useEffect(() => {
    if (courseParam && !selectedCourse) {
      setSelectedCourse(courseParam);
    }
  }, [courseParam, selectedCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name || !phone || !selectedCourse) {
        throw new Error('Please fill all fields');
      }

      if (phone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      const course = getCourseById(selectedCourse);
      if (!course) {
        throw new Error('Invalid course selected');
      }

      // Create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          customerName: name,
          customerPhone: phone
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'AI Cloud Enterprises',
          description: course.name,
          order_id: orderData.orderId,
          prefill: {
            name: name,
            contact: phone
          },
          theme: {
            color: '#667eea'
          },
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  courseId: selectedCourse,
                  customerName: name,
                  customerPhone: phone
                })
              });

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok && verifyData.success) {
                // Payment successful - redirect to success page
                router.push('/success?course=' + selectedCourse);
              } else {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
            } catch (err) {
              setError(err.message);
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Layout title="Payment - AI Cloud Enterprises">
      <style jsx>{`
        .hero {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('/images/iiskills-main-hero.jpg');
          background-size: cover;
          background-position: center;
          color: white;
          text-align: center;
          padding: 4rem 2rem;
        }

        .hero-content {
          max-width: 900px;
          z-index: 1;
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero p {
          font-size: 1.3rem;
          opacity: 0.95;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .container {
          max-width: 700px;
          margin: 4rem auto;
          padding: 0 2rem;
        }
        
        .payment-card {
          background: white;
          border-radius: 15px;
          padding: 3rem;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .pricing-info {
          background: #f8f9ff;
          padding: 2rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          border-left: 4px solid #667eea;
        }

        .pricing-info h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .price-breakdown {
          margin: 1rem 0;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: #555;
        }

        .price-total {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          margin-top: 1rem;
          border-top: 2px solid #667eea;
          font-weight: bold;
          font-size: 1.3rem;
          color: #667eea;
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
        
        input, select {
          width: 100%;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #667eea;
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
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #fcc;
        }
        
        .course-info {
          background: #f8f9ff;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #667eea;
        }
        
        .course-info h3 {
          color: #667eea;
          margin-bottom: 0.5rem;
          font-size: 1.3rem;
        }

        .course-info p {
          color: #666;
          margin: 0;
        }

        .secure-badge {
          text-align: center;
          margin-top: 1.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .secure-badge::before {
          content: "🔒 ";
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .hero p {
            font-size: 1.2rem;
          }

          .payment-card {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="hero">
        <div className="hero-content">
          <h1>Complete Your Enrollment</h1>
          <p>Secure payment powered by Razorpay</p>
        </div>
      </div>

      <div className="container">
        <div className="payment-card">
          {error && <div className="error">{error}</div>}
          
          {feeInfo && (
            <div className="pricing-info">
              <h3>{feeInfo.period}</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Price:</span>
                  <span>₹{feeInfo.displayBase}</span>
                </div>
                <div className="price-row">
                  <span>GST (18%):</span>
                  <span>₹{feeInfo.displayGst}</span>
                </div>
              </div>
              <div className="price-total">
                <span>Total Amount:</span>
                <span>₹{feeInfo.displayTotal}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="course">Select Course *</label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && getCourseById(selectedCourse) && (
              <div className="course-info">
                <h3>{getCourseById(selectedCourse).name}</h3>
                <p>{getCourseById(selectedCourse).description}</p>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Your Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your 10-digit phone number"
                pattern="[0-9]{10,}"
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : `Pay ₹${feeInfo?.displayTotal || '...'}`}
            </button>

            <div className="secure-badge">
              Secure payment processing
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
