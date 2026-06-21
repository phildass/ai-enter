import { createClient } from '@supabase/supabase-js';

/**
 * Mark the latest pending payment_transactions row as failed so the next
 * create-order issues a fresh Razorpay order (used for payment_retry=1).
 */
export async function invalidatePendingPaymentTransaction({ appName, sessionId }) {
  if (!appName || !sessionId) {
    return { ok: false, reason: 'missing_ids' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, reason: 'no_supabase' };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: rows, error } = await supabase
    .from('payment_transactions')
    .select('id, razorpay_order_id, status')
    .eq('app_name', appName)
    .eq('session_id', sessionId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('[invalidate-pending] lookup failed:', error.message);
    return { ok: false, reason: 'lookup_failed' };
  }

  const row = rows?.[0];
  if (!row) {
    return { ok: true, action: 'none', reason: 'no_pending_row' };
  }

  const { error: updateErr } = await supabase
    .from('payment_transactions')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('id', row.id);

  if (updateErr) {
    console.error('[invalidate-pending] update failed:', updateErr.message);
    return { ok: false, reason: 'update_failed' };
  }

  console.log('[invalidate-pending] marked failed', {
    app_name: appName,
    session_id: sessionId,
    order_id: row.razorpay_order_id || null,
  });

  return {
    ok: true,
    action: 'invalidated',
    orderId: row.razorpay_order_id || null,
  };
}
