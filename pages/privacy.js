import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout title="Privacy Policy - AI Cloud Enterprises">
      <style jsx>{`
        .privacy-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }

        .privacy-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .privacy-hero p {
          font-size: 1.1rem;
          opacity: 0.95;
        }

        .container {
          max-width: 900px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .content {
          background: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .content h2 {
          color: #667eea;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }

        .content h2:first-of-type {
          margin-top: 0;
        }

        .content p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .content ul {
          color: #666;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        .content li {
          margin-bottom: 0.5rem;
        }

        .last-updated {
          color: #999;
          font-style: italic;
          text-align: center;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .privacy-hero h1 {
            font-size: 2rem;
          }

          .content {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="privacy-hero">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us</p>
      </div>

      <div className="container">
        <div className="content">
          <h2>1. Introduction</h2>
          <p>
            AI Cloud Enterprises ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website and enroll in our courses.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Personal identification information (name, phone number, email address)</li>
            <li>Payment and billing information</li>
            <li>Course enrollment and progress data</li>
            <li>Communications you send to us</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your course enrollments and payments</li>
            <li>Provide and deliver the courses you have enrolled in</li>
            <li>Send you updates, course materials, and administrative information</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Improve our services and develop new offerings</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. 
            We may share your information only in the following circumstances:
          </p>
          <ul>
            <li>With service providers who assist us in operating our platform (e.g., payment processors)</li>
            <li>When required by law or to protect our rights</li>
            <li>With your explicit consent</li>
          </ul>

          <h2>5. Payment Processing</h2>
          <p>
            Payment processing is handled securely through Razorpay. We do not store your complete 
            credit card or banking information on our servers. Please refer to Razorpay's privacy 
            policy for information on how they handle your payment data.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, 
            no method of transmission over the Internet or electronic storage is 100% secure.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and receive a copy of your personal information</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information (subject to legal obligations)</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes 
            outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 18. We do not knowingly 
            collect personal information from children.
          </p>

          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our 
            Contact page or at the contact information provided on our website.
          </p>

          <p className="last-updated">Last Updated: February 10, 2026</p>
        </div>
      </div>
    </Layout>
  );
}
