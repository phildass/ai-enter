import { useMemo, useState } from 'react';
import SegmentPaymentPage from '../../components/SegmentPaymentPage';
import { verifyAppmallToken } from '../../lib/verifyAppmallToken';
import { invalidatePendingPaymentTransaction } from '../../lib/invalidatePendingPayment';
import {
  APPMALL_ALLOWED_COURSES,
  HELLO_PASS_PLANS,
  getHelloPassPlan,
  isHelloPassCourse,
} from '../../lib/courses';

const NO_TOKEN_ERROR = {
  title: 'Payment Link Required',
  lines: [
    'This page can only be accessed from hello.appmall.in after you start a messaging-pass checkout.',
    'Please return to Hello and choose a messaging pass again.',
  ],
  portalUrl: 'https://hello.appmall.in/pass',
  portalLabel: 'Go to Hello Pass',
};

function makeTokenVerificationError(reason) {
  return {
    title: 'Payment Link Expired or Invalid',
    lines: [
      'Your payment link could not be verified.',
      `Reason: ${reason}`,
      'Please go back to Hello and start checkout again.',
    ],
    portalUrl: 'https://hello.appmall.in/pass',
    portalLabel: 'Go to Hello Pass',
  };
}

export async function getServerSideProps({ query }) {
  const { purchaseId, token, payment_retry, course_id, course } = query;
  const paymentRetry = payment_retry === '1';
  const courseSlug =
    typeof course_id === 'string' ? course_id : typeof course === 'string' ? course : 'hello-pass-1d';
  const initialPlan = getHelloPassPlan(courseSlug) || HELLO_PASS_PLANS[0];

  if (!token) {
    return {
      props: {
        tokenError: NO_TOKEN_ERROR,
        initialPlanId: initialPlan.id,
      },
    };
  }

  try {
    const payload = verifyAppmallToken(token, { expectedPurchaseId: purchaseId });

    if (!APPMALL_ALLOWED_COURSES.includes(payload.courseSlug)) {
      return {
        props: {
          tokenError: makeTokenVerificationError(`Course "${payload.courseSlug}" is not available.`),
          initialPlanId: initialPlan.id,
        },
      };
    }

    if (!isHelloPassCourse(payload.courseSlug)) {
      return {
        props: {
          tokenError: makeTokenVerificationError(
            'This checkout is only for Hello messaging passes.',
          ),
          initialPlanId: initialPlan.id,
        },
      };
    }

    if (paymentRetry) {
      await invalidatePendingPaymentTransaction({
        appName: 'appmall',
        sessionId: payload.purchaseId,
      });
    }

    const queryName = typeof query.user_name === 'string' ? query.user_name.trim() : '';
    const queryPhone = typeof query.phone === 'string' ? query.phone.trim() : '';
    const queryEmail = typeof query.email === 'string' ? query.email.trim() : '';
    const planFromToken = getHelloPassPlan(payload.courseSlug) || initialPlan;

    return {
      props: {
        tokenPayload: {
          ...payload,
          name: payload.name || queryName || null,
          user_name: payload.user_name || queryName || payload.name || null,
          phone: payload.phone || queryPhone || null,
          email: payload.email || queryEmail || null,
          user_email: payload.user_email || payload.email || queryEmail || null,
        },
        rawToken: token,
        purchaseId: payload.purchaseId,
        paymentRetry,
        initialPlanId: planFromToken.id,
      },
    };
  } catch (err) {
    console.error('[hello-payments] Token verification failed:', err.message);

    const reason = /expire/i.test(err.message)
      ? 'The payment link has expired. Please get a new one.'
      : /signature/i.test(err.message)
        ? 'Security verification failed. The server configuration may need updating.'
        : /secret|configured/i.test(err.message)
          ? 'Payment server is not properly configured. Please contact support.'
          : err.message || 'Unknown verification error.';

    return {
      props: {
        tokenError: makeTokenVerificationError(reason),
        initialPlanId: initialPlan.id,
      },
    };
  }
}

export default function HelloPaymentsPage({
  tokenPayload,
  rawToken,
  tokenError,
  paymentRetry,
  initialPlanId,
}) {
  const [planId, setPlanId] = useState(initialPlanId || HELLO_PASS_PLANS[0].id);
  const plan = useMemo(
    () => getHelloPassPlan(planId) || HELLO_PASS_PLANS[0],
    [planId],
  );

  return (
    <div>
      {!tokenError && (
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto',
            padding: '1.25rem 1rem 0',
          }}
        >
          <p style={{ fontWeight: 600, color: '#1c1917', marginBottom: '0.75rem' }}>
            Choose a Hello messaging pass
          </p>
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {HELLO_PASS_PLANS.map((p) => {
              const selected = p.id === plan.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.85rem 1rem',
                    borderRadius: 12,
                    border: selected ? '2px solid #e11d48' : '1px solid #e7e5e4',
                    background: selected ? '#ffe4e6' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#1c1917' }}>{p.label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#78716c', marginTop: 2 }}>
                    {p.displayPrice}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SegmentPaymentPage
        key={plan.id}
        segmentKey="appmall"
        brandName="Hello"
        emoji="💬"
        bgGradient="linear-gradient(135deg, #fff1f2 0%, #ccfbf1 100%)"
        iconBg="#ffe4e6"
        titleColor="#e11d48"
        accentGradient="linear-gradient(135deg, #e11d48 0%, #0f766e 100%)"
        accentColor="#e11d48"
        accentDisabled="#94a3b8"
        validityText={plan.validityText}
        validityLabel="Unlimited in-app messages for the pass period"
        features={[
          'Unlimited in-app messaging while the pass is active',
          'First Hello payment also grants App Mall suite membership',
          'Price includes 18% GST + 2% service fee',
          'External phones, emails and social links stay blocked',
          'Women who are App Mall Reg Users message free — this pass is for male / other profiles',
        ]}
        limitedTimeNotice="Hello checkout — messaging pass + App Mall membership on first payment. Amount includes 18% GST + 2% service fee."
        originDomain="hello.appmall.in"
        description={`Hello messaging — ${plan.label}`}
        tokenKind="appmall"
        tokenPayload={tokenPayload || null}
        rawToken={rawToken || null}
        tokenError={tokenError || null}
        fixedCourseLabel={`Hello — ${plan.label} — ${plan.displayPrice}`}
        paymentCourse={plan.id}
        displayPrice={plan.displayPrice}
        priceBreakdown={plan.priceBreakdown}
        amountPaise={plan.amountPaise}
        paymentRetry={paymentRetry}
      />
    </div>
  );
}
