import Layout from '../components/Layout';

export default function Terms() {
  return (
    <Layout title="Terms & Conditions - AI Cloud Enterprises">
      <style jsx>{`
        .terms-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }

        .terms-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .terms-hero p {
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
          .terms-hero h1 {
            font-size: 2rem;
          }

          .content {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="terms-hero">
        <h1>Terms & Conditions</h1>
        <p>Please read these terms carefully before using our services</p>
      </div>

      <div className="container">
        <div className="content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using AI Cloud Enterprises platforms and services — including IISkills, Jai Bharat, and Jai Kisan — 
            you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part 
            of these terms, you may not use our services.
          </p>

          <h2>2. Service Enrollment and Payment</h2>
          <p>
            When you subscribe to or purchase access to any of our products or services, you agree to pay the applicable fees as displayed at the time of purchase. All fees are in Indian Rupees (INR) and include applicable GST.
          </p>
          <ul>
            <li>Pricing is displayed at the time of purchase on the relevant product platform</li>
            <li>All payments are processed securely through Razorpay</li>
            <li>Payment can only be initiated from the respective product platform (iiskills.in, jaibharat.cloud, or jaikisan.cloud)</li>
          </ul>

          <h2>3. Service Access and Content</h2>
          <p>
            Upon successful payment, you will receive access to the product or service you have subscribed to. Access and materials are provided for personal, non-commercial use only.
          </p>
          <ul>
            <li>You may not share your access credentials with others</li>
            <li>You may not reproduce, distribute, or sell content or materials provided through our services</li>
            <li>We reserve the right to update service content at any time</li>
            <li>Access is provided for the duration specified at the time of purchase</li>
          </ul>

          <h2>4. Refund Policy</h2>
          <p>
            Due to the digital nature of our services and immediate access upon purchase, 
            all sales are final. However, we may consider refund requests on a case-by-case 
            basis within 7 days of purchase if:
          </p>
          <ul>
            <li>You have not accessed more than 10% of the service content</li>
            <li>There are technical issues preventing access that we cannot resolve</li>
            <li>The service content significantly differs from what was advertised</li>
          </ul>

          <h2>5. User Conduct</h2>
          <p>You agree to use our services in a lawful and respectful manner. Prohibited activities include:</p>
          <ul>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Harassing or threatening other users or staff</li>
            <li>Uploading malicious code or viruses</li>
            <li>Violating intellectual property rights</li>
            <li>Using the platform for any illegal purposes</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content, materials, trademarks, and other intellectual property on AI Cloud Enterprises 
            platforms are owned by or licensed to us. You may not use our 
            intellectual property without prior written permission.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            Our services and platforms are provided "as is" without warranties of any kind, either 
            express or implied. We do not guarantee specific outcomes from using our services, 
            and results may vary based on individual effort and circumstances.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AI Cloud Enterprises shall not be liable for 
            any indirect, incidental, special, consequential, or punitive damages resulting from 
            your use of or inability to use our services.
          </p>

          <h2>9. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to our services at any time 
            if you violate these Terms & Conditions or engage in activities that harm our platform 
            or other users.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may modify these Terms & Conditions at any time. We will notify users of significant 
            changes via email or platform notifications. Continued use of our services after changes 
            constitutes acceptance of the updated terms.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms & Conditions are governed by the laws of India. Any disputes arising from 
            these terms or your use of our services shall be subject to the exclusive jurisdiction 
            of the courts in India.
          </p>

          <h2>12. Contact Information</h2>
          <p>
            For questions about these Terms & Conditions or to request a refund, please contact us 
            through our Contact page or at the contact information provided on our website.
          </p>

          <p className="last-updated">Last Updated: February 10, 2026</p>
        </div>
      </div>
    </Layout>
  );
}
