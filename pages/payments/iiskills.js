import { useState } from 'react';
import { verifyIiskillsToken } from '../../lib/verifyIiskillsToken';
import { IISKILLS_ALLOWED_COURSES } from '../../lib/courses';

const DIRECT_ACCESS_ERROR = {
  title: '⚠️ Direct Access Not Allowed',
  lines: [
    'Payments are only accepted from official AI Cloud Enterprises portals.',
    'For iiskills payments, please visit:',
    'If you were redirected here by iiskills.in, please try again or contact support.',
    'This security measure protects your payment information.',
  ],
  portalUrl: 'https://iiskills.in',
  portalLabel: '🔗 https://iiskills.in',
};

export async function getServerSideProps({ query }) {
  const { token } = query;

  if (!token) {
    return {
      props: { tokenError: DIRECT_ACCESS_ERROR },
    };
  }

  try {
    const payload = verifyIiskillsToken(token);

    // Validate course slug against the allowlist
    if (!IISKILLS_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return { props: { tokenError: 'Course not available for purchase.' } };
    }

    return {
      props: {
        tokenPayload: payload,
        rawToken: token,
      },
    };
  } catch (err) {
    console.error('[iiskills-payments] Token verification failed:', err.message);
    return {
      props: { tokenError: DIRECT_ACCESS_ERROR },
    };
  }
}

export default function IisSkillsPaymentsPage({ tokenPayload, tokenError }) {
  const [selectedCourse, setSelectedCourse] = useState(
    tokenPayload?.courseSlug || 'learn-ai'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine if we're in bundle phase (till June 15, 2026, 11:59:59 PM UTC)
  const CUTOFF_DATE = new Date('2026-06-16T00:00:00Z');
  const isBundlePhase = new Date() < CUTOFF_DATE;

  // Extract user data from token
  const firstName = tokenPayload?.firstName || tokenPayload?.name || '';
  const lastName = tokenPayload?.lastName || '';
  const phone = tokenPayload?.phone || '';

  // Pricing
  const BASE_PRICE = 99;
  const GST_RATE = 0.18;
  const GST_AMOUNT = parseFloat((BASE_PRICE * GST_RATE).toFixed(2));
  const TOTAL_PRICE = parseFloat((BASE_PRICE + GST_AMOUNT).toFixed(2));

  // Course list for dropdown (from June 16 onwards)
  const courseOptions = [
    { id: 'learn-ai', name: 'Learn AI' },
    { id: 'learn-developer', name: 'Learn Developer' },
    { id: 'learn-pr', name: 'Learn PR' },
    { id: 'learn-management', name: 'Learn Management' },
    { id: 'learn-apt', name: 'Learn Aptitude' },
  ];

  const getCourseName = (courseId) => {
    return courseOptions.find((c) => c.id === courseId)?.name || courseId;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const courseId = isBundlePhase ? 'all-courses-bundle' : selectedCourse;

      console.log('Starting payment with:', {
        courseId,
        amount: TOTAL_PRICE,
        firstName,
        lastName,
        phone,
      });

      // TODO: Call actual Razorpay payment API
      alert('Payment processing would start here');
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show error if token verification failed
  if (tokenError) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2 style={styles.errorTitle}>{tokenError.title}</h2>
          {tokenError.lines.map((line, idx) => (
            <p key={idx} style={styles.errorText}>
              {line}
            </p>
          ))}
          <a href={tokenError.portalUrl} style={styles.portalLink}>
            {tokenError.portalLabel}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>📋 Complete Your Order</h1>

        {/* User Details - Display Only */}
        <div style={styles.section}>
          <div style={styles.fieldRow}>
            <label style={styles.label}>Name</label>
            <div style={styles.displayValue}>
              {firstName} {lastName}
            </div>
          </div>

          <div style={styles.fieldRow}>
            <label style={styles.label}>Phone</label>
            <div style={styles.displayValue}>{phone}</div>
          </div>
        </div>

        {/* Course Selection */}
        <div style={styles.section}>
          <label style={styles.label}>Course</label>

          {isBundlePhase ? (
            <div style={styles.displayValue}>
              All Courses (5 Paid Apps)
              <div style={styles.bundleNote}>
                Limited Time Offer - Valid till June 15, 2026
              </div>
            </div>
          ) : (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={styles.select}
            >
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Pricing */}
        <div style={styles.pricingBox}>
          <div style={styles.pricingRow}>
            <span>Base Price:</span>
            <span>Rs {BASE_PRICE}</span>
          </div>
          <div style={styles.pricingRow}>
            <span>GST (18%):</span>
            <span>Rs {GST_AMOUNT.toFixed(2)}</span>
          </div>
          <div style={{ ...styles.pricingRow, ...styles.totalRow }}>
            <span style={styles.totalLabel}>Total:</span>
            <span style={styles.totalPrice}>Rs {TOTAL_PRICE.toFixed(2)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && <div style={styles.errorMessage}>{error}</div>}

        {/* Submit Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>

        {/* Footer Message */}
        <p style={styles.footerText}>
          From <strong>aienter.in</strong>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    padding: '2rem',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  formBox: {
    maxWidth: '500px',
    width: '100%',
    background: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#667eea',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  section: {
    marginBottom: '2rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldRow: {
    marginBottom: '1.5rem',
  },
  displayValue: {
    fontSize: '1rem',
    color: '#555',
    padding: '0.75rem 1rem',
    background: '#f8f9ff',
    borderRadius: '8px',
    border: '1px solid #e0e0ff',
  },
  bundleNote: {
    fontSize: '0.85rem',
    color: '#764ba2',
    marginTop: '0.5rem',
    fontWeight: '500',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e0e0ff',
    borderRadius: '8px',
    background: 'white',
    color: '#333',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    fontFamily: "'Inter', sans-serif",
  },
  pricingBox: {
    background: '#f8f9ff',
    border: '1px solid #e0e0ff',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  pricingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '0.75rem',
  },
  totalRow: {
    borderTop: '2px solid #e0e0ff',
    paddingTop: '1rem',
    marginTop: '1rem',
    marginBottom: 0,
  },
  totalLabel: {
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#667eea',
  },
  button: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    marginBottom: '1rem',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: '0.9rem',
    padding: '0.75rem 1rem',
    background: '#ffe0e0',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#999',
    margin: 0,
  },
  errorBox: {
    maxWidth: '500px',
    background: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: '1rem',
  },
  errorText: {
    color: '#555',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '0.75rem',
  },
  portalLink: {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
};
