import React, { useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// External-token apps (iiskills, uriq): Standard Checkout redirect:true (full Razorpay page).
// Entitlements run only from /api/payments/razorpay-callback or webhook after capture.
// No shared auth cookies — identity is the JWT handoff token stored with the order.

function isMobileCheckout() {
  if (typeof window === 'undefined') return false;
  const uaMatch = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|webOS|BlackBerry/i.test(
    navigator.userAgent,
  );
  const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const narrow = window.innerWidth <= 768;
  return uaMatch || (touchDevice && narrow);
}

function isLikelyUpiTransitionFailure(resp) {
  const text = [
    resp?.error?.description,
    resp?.error?.reason,
    resp?.error?.code,
    resp?.error?.metadata?.payment_reason,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return (
    !text ||
    /upi|cancel|dismiss|intent|timeout|delay|closed|user|another|progress|pending/.test(text)
  );
}

function loadRazorpayCheckoutScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed'));
    document.body.appendChild(script);
  });
}

function getApiBaseUrl() {
  // Payment API routes are on the same Next.js host as this page. Using relative
  // paths avoids broken builds where NEXT_PUBLIC_API_BASE_URL points elsewhere.
  if (typeof window !== 'undefined') return '';
  return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
}

async function readJsonResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    const isHtml = /^\s*</.test(text);
    throw new Error(
      isHtml
        ? `Payment server unavailable (HTTP ${res.status}). Please try again in a moment.`
        : `Payment server returned an unexpected response (HTTP ${res.status}).`,
    );
  }
}

function appendFreshOrderFlag(body, needsFreshOrder) {
  if (!needsFreshOrder) return body;
  return { ...body, fresh_order: true };
}

function extractTokenPhone(tokenPayload) {
  if (!tokenPayload) return '';
  const raw =
    tokenPayload.phone ||
    tokenPayload.user_phone ||
    tokenPayload.mobile ||
    tokenPayload.phone_number ||
    tokenPayload.contact;
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
}

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  );
}

const COURSE_LABELS = {
  'learn-ai': 'Learn AI',
  'learn-developer': 'Learn Developer',
  'learn-pr': 'Learn PR',
  'learn-management': 'Learn Management',
  'skills-passport': 'Skills Passport',
  'all-courses-bundle': 'All Courses (5 Paid Apps)',
};

const PHONE_RE = /^\d{10}$/;

const CHECKOUT_SESSION_KEY = 'aienter_checkout_session';

function persistCheckoutSession(snapshot) {
  if (typeof window === 'undefined') return false;
  if (!snapshot?.orderId) {
    console.warn('[payment] Refusing to persist checkout session: missing orderId');
    return false;
  }
  try {
    sessionStorage.setItem(
      CHECKOUT_SESSION_KEY,
      JSON.stringify({ ...snapshot, savedAt: Date.now() }),
    );
    return true;
  } catch (e) {
    console.warn('[payment] Could not persist checkout session:', e);
    return false;
  }
}

function clearCheckoutSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  } catch {
    // ignore
  }
}

const DASHBOARD_URLS = {
  iiskills: 'https://iiskills.in/dashboard',
  'uriq.in': 'https://uriq.in/dashboard',
};

function finishPaymentRedirect(redirect, sessionId) {
  const join = redirect.includes('?') ? '&' : '?';
  window.location.href = sessionId
    ? `${redirect}${join}session_id=${encodeURIComponent(sessionId)}&status=success`
    : `${redirect}${join}status=success`;
}

export default function SegmentPaymentPage({
  segmentKey,
  brandName,
  emoji,
  bgGradient,
  iconBg,
  titleColor,
  accentGradient,
  accentColor,
  accentDisabled,
  validityText,
  validityLabel,
  features,
  originDomain,
  description,
  tokenPayload,
  rawToken,
  tokenKind,
  tokenError,
  allowedCourses,
  fixedCourseLabel,
  paymentCourse,
  displayPrice,
  priceBreakdown,
}) {
  const router = useRouter();

  const userIdFromToken = tokenPayload ? tokenPayload.user_id : undefined;
  const userEmailFromToken = tokenPayload ? tokenPayload.user_email : undefined;

  const userId = tokenPayload ? userIdFromToken : router.query.user_id;
  const userEmail = tokenPayload ? userEmailFromToken : router.query.email;

  // purchaseId may be in the URL (?purchaseId=) or embedded in the JWT (iiskills/uriq).
  const purchaseId =
    (router.isReady ? router.query.purchaseId : undefined) || tokenPayload?.purchaseId;
  const courseFromQuery = router.isReady ? router.query.course : undefined;

  const [selectedCourse, setSelectedCourse] = useState('');
  const selectedOrQueryCourse = allowedCourses ? courseFromQuery || selectedCourse || '' : null;
  const course = paymentCourse || selectedOrQueryCourse || null;

  const courseAllowed =
    fixedCourseLabel ||
    paymentCourse ||
    !allowedCourses ||
    allowedCourses.includes(selectedOrQueryCourse);

  const [processing, setProcessing] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [awaitingUpiReturn, setAwaitingUpiReturn] = useState(false);
  const [confirmRetryPayload, setConfirmRetryPayload] = useState(null);
  const needsFreshOrderRef = useRef(false);
  const pendingCheckoutRef = useRef(null);
  const resumeInFlightRef = useRef(false);
  const paymentInFlightRef = useRef(false);
  const razorpayOpenedRef = useRef(false);
  const payButtonRef = useRef(null);

  const lockPayButton = () => {
    if (paymentInFlightRef.current || isInitiating) return false;
    paymentInFlightRef.current = true;
    setIsInitiating(true);
    if (payButtonRef.current) {
      payButtonRef.current.disabled = true;
    }
    return true;
  };

  const unlockPayButton = () => {
    paymentInFlightRef.current = false;
    razorpayOpenedRef.current = false;
    setIsInitiating(false);
  };

  const openRazorpayOnce = (options) => {
    if (razorpayOpenedRef.current) {
      console.warn('[payment] blocked duplicate Razorpay.open()', {
        order_id: options?.order_id,
      });
      return null;
    }
    razorpayOpenedRef.current = true;
    console.log('[payment] Razorpay.open', {
      ts: new Date().toISOString(),
      order_id: options?.order_id,
    });
    const rzp = new window.Razorpay(options);
    rzp.open();
    return rzp;
  };

  const tryResumePayment = async () => {
    const pending = pendingCheckoutRef.current;
    if (!pending || resumeInFlightRef.current) return false;

    resumeInFlightRef.current = true;
    setStatusText('Checking payment status…');

    try {
      const body = {
        order_id: pending.orderId,
        purchaseId: pending.purchaseId,
        course: pending.course,
        app_name: pending.segmentKey,
      };

      if (pending.activeTokenKind === 'uriq') {
        body.uriq_token = pending.rawToken;
      } else if (pending.activeTokenKind === 'iiskills') {
        body.iiskills_token = pending.rawToken;
      }

      const res = await fetchWithTimeout(`${getApiBaseUrl()}/api/payments/resume-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await readJsonResponse(res);

      if (json?.paid && json?.redirect_url) {
        pendingCheckoutRef.current = null;
        clearCheckoutSession();
        setAwaitingUpiReturn(false);
        setStatusText('Redirecting…');
        finishPaymentRedirect(json.redirect_url);
        return true;
      }

      setStatusText('');
      return false;
    } catch (e) {
      console.error('[payment] resume check failed:', e);
      return false;
    } finally {
      resumeInFlightRef.current = false;
    }
  };

  const checkPaymentStatus = async () => {
    if (!pendingCheckoutRef.current || resumeInFlightRef.current) return;
    setProcessing(true);
    setError('');
    setStatusText('Checking payment status…');
    const ok = await tryResumePayment();
    if (!ok) {
      setProcessing(false);
      setStatusText('');
      setAwaitingUpiReturn(true);
    }
  };

  // Customer details (used on iiskills page)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const canSubmitCustomerDetails = useMemo(() => {
    if (!allowedCourses) return true;
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      PHONE_RE.test(phone.trim())
    );
  }, [allowedCourses, firstName, lastName, phone]);

  const activeTokenKind = tokenKind || (segmentKey === 'iiskills' ? 'iiskills' : 'session');
  const isExternalTokenSegment =
    (activeTokenKind === 'iiskills' || activeTokenKind === 'uriq') && !!rawToken;
  const tokenPhone = extractTokenPhone(tokenPayload);
  const needsPhoneInput = isExternalTokenSegment && activeTokenKind === 'iiskills' && !tokenPhone;
  const usesRedirectCheckout = isExternalTokenSegment;

  // Main pay action — atomic lock prevents duplicate create-order / double UPI intent.
  const handlePay = async () => {
    console.log('[payment] handlePay start', {
      ts: new Date().toISOString(),
      segmentKey,
      purchaseId: purchaseId || null,
      inFlight: paymentInFlightRef.current,
      isInitiating,
      processing,
    });

    if (!lockPayButton()) {
      console.log('[payment] handlePay blocked — pay lock already held');
      return;
    }

    setProcessing(true);
    setStatusText('Creating order…');
    setError('');
    setAwaitingUpiReturn(false);
    setConfirmRetryPayload(null);

    const apiBase = getApiBaseUrl();
    let leavingForCheckout = false;

    try {
      let body;

      if (isExternalTokenSegment) {
        if (!purchaseId) throw new Error('Invalid payment link. Missing purchaseId.');
        body =
          activeTokenKind === 'uriq'
            ? { uriq_token: rawToken, purchaseId }
            : {
                iiskills_token: rawToken,
                purchaseId,
                ...(course ? { course } : {}),
                ...(phone.trim() ? { customer_phone: phone.trim() } : {}),
              };
      } else {
        body = rawToken
          ? {
              session_token: rawToken,
              ...(course ? { course } : {}),
            }
          : {
              user_id: userId,
              app_name: segmentKey,
              user_email: userEmail || '',
              customer_name: allowedCourses
                ? `${firstName.trim()} ${lastName.trim()}`
                : undefined,
              user_phone: allowedCourses ? phone.trim() : undefined,
              course: course || undefined,
            };
      }

      console.log('[payment] Creating order for app:', segmentKey);

      let createRes;
      try {
        createRes = await fetchWithTimeout(`${apiBase}/api/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appendFreshOrderFlag(body, needsFreshOrderRef.current)),
        });
      } catch (e) {
        if (e.name === 'AbortError') {
          throw new Error(
            'Order creation timed out. Please check your connection and try again.',
          );
        }
        throw new Error(
          'Could not reach the payment server. Please check your connection and try again.',
        );
      }


      const createJson = await readJsonResponse(createRes);
      if (!createRes.ok) {
        console.error('[payment] Order creation failed:', createJson?.error);
        if (createRes.status === 409) {
          setError(createJson?.error || 'This payment link has already been used. Please start a new purchase.');
          setProcessing(false);
          setStatusText('');
          unlockPayButton();
          return;
        }
        throw new Error(createJson?.error || 'Payment could not be initiated. Please try again.');
      }

      console.log('[payment] Order created:', createJson.orderId, createJson.reused ? '(reused)' : '(new)');
      needsFreshOrderRef.current = false;

      setStatusText('Loading payment gateway…');

      try {
        await loadRazorpayCheckoutScript();
      } catch {
        setError('Failed to load payment gateway. Please try again.');
        setProcessing(false);
        setStatusText('');
        unlockPayButton();
        return;
      }

      const callbackUrl = `${window.location.origin}/api/payments/razorpay-callback`;

      const prefill = {};
      const contactPhone = extractTokenPhone(tokenPayload) || phone.trim();
      if (contactPhone) prefill.contact = contactPhone;
      if (tokenPayload?.name || tokenPayload?.customer_name) {
        prefill.name = tokenPayload.name || tokenPayload.customer_name;
      }
      if (userEmailFromToken) prefill.email = userEmailFromToken;

      // External-token apps: full-page Razorpay checkout — entitlements via server callback only.
      if (usesRedirectCheckout) {
        setStatusText('Redirecting to secure payment…');

        const persisted = persistCheckoutSession({
          orderId: createJson.orderId,
          purchaseId,
          course,
          segmentKey,
          activeTokenKind,
          rawToken: rawToken || null,
          returnUrl: createJson.return_url || null,
          checkoutStartedAt: Date.now(),
        });

        if (!persisted) {
          throw new Error('Could not save checkout session. Please try again.');
        }

        const options = {
          key: createJson.keyId,
          amount: createJson.amount,
          currency: createJson.currency,
          name: brandName,
          description,
          order_id: createJson.orderId,
          callback_url: callbackUrl,
          redirect: true,
          retry: { enabled: false },
          ...(Object.keys(prefill).length > 0 ? { prefill } : {}),
          theme: { color: accentColor },
        };

        const rzp = openRazorpayOnce(options);
        if (!rzp) {
          throw new Error('Payment window is already open. Please complete or cancel it first.');
        }
        leavingForCheckout = true;
        return;
      }

      setStatusText('Payment window opened — complete payment to continue…');

      const mobileCheckout = isMobileCheckout();

      pendingCheckoutRef.current = {
        orderId: createJson.orderId,
        purchaseId,
        course,
        activeTokenKind,
        rawToken,
        segmentKey,
      };

      persistCheckoutSession({
        orderId: createJson.orderId,
        purchaseId,
        course,
        segmentKey,
        activeTokenKind,
        rawToken: rawToken || null,
        returnUrl: createJson.return_url || null,
        checkoutStartedAt: Date.now(),
      });

      const options = {
        key: createJson.keyId,
        amount: createJson.amount,
        currency: createJson.currency,
        name: brandName,
        description,
        order_id: createJson.orderId,
        retry: { enabled: false },
        ...(Object.keys(prefill).length > 0 ? { prefill } : {}),
        ...(mobileCheckout ? { callback_url: callbackUrl, redirect: true } : {}),

        handler: async function (resp) {
          // Mobile UPI completes via server callback after redirect — ignore JS handler.
          if (mobileCheckout) return;

          try {
            if (
              !resp?.razorpay_order_id ||
              !resp?.razorpay_payment_id ||
              !resp?.razorpay_signature
            ) {
              setError('Payment did not complete. Please try again.');
              setProcessing(false);
              setStatusText('');
              return;
            }

            pendingCheckoutRef.current = null;
            clearCheckoutSession();
            setAwaitingUpiReturn(false);
            setStatusText('Verifying payment…');

            await verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              orderData: createJson,
            });
          } catch (e) {
            setError(e?.message || 'Payment verification failed. Please try again.');
            setProcessing(false);
            setStatusText('');
          }
        },

        modal: {
          confirm_close: true,
          escape: false,
          backdropclose: false,
          ondismiss: function () {
            unlockPayButton();
            if (pendingCheckoutRef.current) {
              setAwaitingUpiReturn(true);
              setError('');
              setProcessing(false);
              setStatusText('');
              return;
            }
            clearCheckoutSession();
            setError('Payment cancelled. No money was debited.');
            setProcessing(false);
            setStatusText('');
          },
        },

        theme: { color: accentColor },
      };

      const rzp = openRazorpayOnce(options);
      if (!rzp) {
        throw new Error('Payment window is already open. Please complete or cancel it first.');
      }

      rzp.on('payment.failed', function (resp) {
        if (pendingCheckoutRef.current && isLikelyUpiTransitionFailure(resp)) {
          setAwaitingUpiReturn(true);
          setError('');
          setProcessing(false);
          setStatusText('');
          return;
        }

        unlockPayButton();
        needsFreshOrderRef.current = true;
        pendingCheckoutRef.current = null;
        clearCheckoutSession();
        setAwaitingUpiReturn(false);

        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment failed. Tap Pay again to retry.';

        setError(msg);
        setProcessing(false);
        setStatusText('');
      });

      if (mobileCheckout) {
        leavingForCheckout = true;
      }
      return;
    } catch (e) {
      console.error('[payment] Unexpected error:', e);
      setError(e?.message || 'Payment failed. Please try again.');
      setProcessing(false);
      setStatusText('');
    } finally {
      if (!leavingForCheckout) {
        unlockPayButton();
      }
    }
  };

  const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
  }) => {
    const apiBase = getApiBaseUrl();

    let body;

    if (isExternalTokenSegment) {
      if (!purchaseId) {
        setError('Invalid payment link. Missing purchaseId.');
        setProcessing(false);
        setStatusText('');
        return;
      }
      body =
        activeTokenKind === 'uriq' ?
          {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            uriq_token: rawToken,
            purchaseId,
          }
        : {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            iiskills_token: rawToken,
            purchaseId,
            ...(course ? { course } : {}),
          };
    } else {
      body = rawToken
        ? {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            session_token: rawToken,
          }
        : {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id: userId,
            app_name: segmentKey,
            course: course || undefined,
          };
    }

    let res;
    try {
      res = await fetchWithTimeout(`${apiBase}/api/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      const msg =
        e.name === 'AbortError'
          ? `Payment verification timed out. Your payment may have succeeded — please contact support with your payment ID: ${razorpay_payment_id}`
          : `Could not reach the verification server. Your payment may have succeeded — please contact support with your payment ID: ${razorpay_payment_id}`;
      console.error('[payment] Verify fetch error:', e);
      setError(msg);
      setProcessing(false);
      setStatusText('');
      return;
    }

    const json = await readJsonResponse(res);

    if (json?.success && json?.confirmFailed) {
      console.error(
        '[payment] iiskills confirm failed:',
        json.confirmError,
        'purchaseId:',
        json.purchaseId,
        'paymentId:',
        razorpay_payment_id,
      );

      setConfirmRetryPayload({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderData,
      });

      setError(
        'Payment received but confirmation failed. Please use the button below to retry.',
      );
      setProcessing(false);
      setStatusText('');
      return;
    }

    if (json?.success) {
      console.log('[payment] Verification successful, redirecting');
      clearCheckoutSession();
      setStatusText('Redirecting…');

      const redirect =
        json.redirect_url ||
        json.return_url ||
        (orderData && orderData.return_url) ||
        DASHBOARD_URLS[segmentKey];

      if (redirect) {
        finishPaymentRedirect(redirect, json.session_id || (orderData && orderData.session_id));
      } else {
        router.push(`/payments/success?app=${encodeURIComponent(segmentKey)}`);
      }
      return;
    }

    console.error('[payment] Verification failed:', json);
    setError(
      `Payment verification failed. Please contact support with your payment ID: ${razorpay_payment_id}`,
    );
    setProcessing(false);
    setStatusText('');
  };

  const retryConfirmation = async () => {
    if (!confirmRetryPayload) return;
    setProcessing(true);
    setStatusText('Retrying confirmation…');
    setError('');
    await verifyPayment(confirmRetryPayload);
  };

  // Render guards
  if (tokenError) {
    const isRichTokenError = tokenError && typeof tokenError === 'object';
    const tokenErrorTitle = isRichTokenError ? tokenError.title : null;
    const tokenErrorLines = isRichTokenError
      ? tokenError.lines
      : [tokenError || `Invalid payment link. Please open from ${originDomain}.`];
    const tokenErrorPortalUrl = isRichTokenError ? tokenError.portalUrl : null;
    const tokenErrorPortalLabel = isRichTokenError ? tokenError.portalLabel : null;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgGradient }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '2rem', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', maxWidth: 460 }}>
          {tokenErrorTitle && (
            <h2 style={{ color: '#4c1d95', margin: '0 0 1rem', fontSize: '1.35rem' }}>
              {tokenErrorTitle}
            </h2>
          )}
          {tokenErrorLines.map((line) => (
            <p key={line} style={{ color: '#ef4444', marginBottom: '0.75rem', fontSize: '0.95rem', lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
          {tokenErrorPortalUrl && (
            <a
              href={tokenErrorPortalUrl}
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: 8,
                textDecoration: 'none',
                background: accentGradient,
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              {tokenErrorPortalLabel || tokenErrorPortalUrl}
            </a>
          )}
        </div>
      </div>
    );
  }

  // Basic page shell (kept consistent with your existing UI approach)
  const disablePay =
    isInitiating ||
    processing ||
    !courseAllowed ||
    (needsPhoneInput && !PHONE_RE.test(phone.trim())) ||
    (allowedCourses && !fixedCourseLabel && (!selectedOrQueryCourse || !canSubmitCustomerDetails));

  return (
    <>
      <Head>
        <title>{brandName} Payment - {displayPrice || '₹116.82'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          background: bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '100%',
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: 72,
                height: 72,
                background: iconBg,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2.5rem',
              }}
            >
              {emoji}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: titleColor, marginBottom: '0.25rem' }}>
              {brandName}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Complete Your Payment</p>
          </div>

          {fixedCourseLabel && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Course
              </p>
              <div
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  color: '#374151',
                  background: '#f9fafb',
                }}
              >
                {fixedCourseLabel}
              </div>
            </div>
          )}

          {!fixedCourseLabel && allowedCourses && router.isReady && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Select your course:
              </p>

              <select
                value={selectedOrQueryCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: `1px solid ${courseAllowed ? '#d1d5db' : '#f87171'}`,
                  fontSize: '0.95rem',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="">-- Select a course --</option>
                {allowedCourses.map((c) => (
                  <option key={c} value={c}>
                    {COURSE_LABELS[c] || c}
                  </option>
                ))}
              </select>

              {!courseAllowed && selectedOrQueryCourse === '' && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  Please select a course to continue.
                </p>
              )}
            </div>
          )}

          {needsPhoneInput && router.isReady && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                Mobile Number * (required for UPI)
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 8,
                  border: `1px solid ${phone && !PHONE_RE.test(phone) ? '#f87171' : '#d1d5db'}`,
                  fontSize: '0.9rem',
                  color: '#374151',
                }}
              />
              {phone && !PHONE_RE.test(phone) && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  Please enter a valid 10-digit phone number.
                </p>
              )}
            </div>
          )}

          {allowedCourses && router.isReady && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                    First Name *
                  </p>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      color: '#374151',
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                    Last Name *
                  </p>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      color: '#374151',
                    }}
                  />
                </div>
              </div>

              <div>
                <p style={{ color: '#374151', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 500 }}>
                  Phone Number * (10 digits)
                </p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 8,
                    border: `1px solid ${
                      phone && !PHONE_RE.test(phone) ? '#f87171' : '#d1d5db'
                    }`,
                    fontSize: '0.9rem',
                    color: '#374151',
                  }}
                />
                {phone && !PHONE_RE.test(phone) && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    Please enter a valid 10-digit phone number.
                  </p>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              background: accentGradient,
              borderRadius: 16,
              padding: '1.5rem',
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: 0.85,
                marginBottom: '0.5rem',
              }}
            >
              {validityLabel}
            </p>

            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700 }}>{displayPrice || '₹116.82'}</span>
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.85, marginBottom: '1rem' }}>
              {priceBreakdown || '(₹99 + 18% GST)'}
            </p>

            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1rem' }}>
              ✅ Valid for {validityText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            ref={payButtonRef}
            type="button"
            onClick={handlePay}
            disabled={disablePay}
            aria-busy={isInitiating || processing}
            aria-disabled={disablePay}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 12,
              border: 'none',
              background: processing ? accentDisabled : accentColor,
              color: 'white',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: disablePay ? 'not-allowed' : 'pointer',
              pointerEvents: disablePay ? 'none' : 'auto',
              transition: '0.2s',
              marginBottom: '0.75rem',
            }}
          >
            {isInitiating || processing ? statusText || 'Processing…' : `Pay ${displayPrice || '₹116.82'}`}
          </button>

          {awaitingUpiReturn && pendingCheckoutRef.current && (
            <>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 12,
                  padding: '0.9rem',
                  color: '#1d4ed8',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                Complete payment in your UPI app. After paying, tap below to continue.
              </div>
              <button
                onClick={checkPaymentStatus}
                disabled={processing}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: 12,
                  border: `2px solid ${accentColor}`,
                  background: 'transparent',
                  color: accentColor,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  transition: '0.2s',
                  marginBottom: '0.75rem',
                }}
              >
                {processing ? statusText || 'Checking…' : 'Check payment status'}
              </button>
            </>
          )}

          {confirmRetryPayload && (
            <button
              onClick={retryConfirmation}
              disabled={processing}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: 12,
                border: `2px solid ${accentColor}`,
                background: 'transparent',
                color: accentColor,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: '0.2s',
                marginBottom: '0.75rem',
              }}
            >
              {processing ? statusText || 'Retrying…' : 'Retry Confirmation'}
            </button>
          )}

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '0.9rem',
                color: '#dc2626',
                fontSize: '0.9rem',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              {error}
            </div>
          )}

          <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center' }}>
            Secured by Razorpay • SSL Encrypted
          </p>
        </div>
      </div>
    </>
  );
}
