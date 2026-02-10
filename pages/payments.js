import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { courses, getCourseById } from '../lib/courses';

export default function Payments() {
  const router = useRouter();
  const { course: courseParam } = router.query;
  
  const [selectedCourse, setSelectedCourse] = useState(courseParam || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          amount: course.price,
          currency: course.currency,
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
          name: 'AI Enter',
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
    <>
      <Head>
        <title>Payments - AI Enter</title>
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
        
        .payment-card {
          background: white;
          border-radius: 10px;
          padding: 3rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        h2 {
          color: #667eea;
          margin-bottom: 2rem;
          text-align: center;
          font-size: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        input, select {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 5px;
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
          padding: 1rem;
          border: none;
          border-radius: 5px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 1rem;
          border: 1px solid #fcc;
        }
        
        .course-info {
          background: #f8f9ff;
          padding: 1.5rem;
          border-radius: 5px;
          margin-bottom: 2rem;
          border-left: 4px solid #667eea;
        }
        
        .course-info h3 {
          color: #667eea;
          margin-bottom: 0.5rem;
        }
        
        .price-display {
          font-size: 1.8rem;
          font-weight: bold;
          color: #667eea;
          margin-top: 0.5rem;
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
        <div className="payment-card">
          <h2>Enroll in a Course</h2>
          
          {error && <div className="error">{error}</div>}
          
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
                    {course.name} - ₹{(course.price / 100).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && getCourseById(selectedCourse) && (
              <div className="course-info">
                <h3>{getCourseById(selectedCourse).name}</h3>
                <p>{getCourseById(selectedCourse).description}</p>
                <div className="price-display">
                  ₹{(getCourseById(selectedCourse).price / 100).toFixed(2)}
                </div>
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
                placeholder="Enter your phone number"
                pattern="[0-9]{10,}"
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>

      <footer>
        <p>&copy; 2026 AI Enter. All rights reserved.</p>
      </footer>
    </>
  );
}
