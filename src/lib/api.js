import { supabase } from '../supabase';

const isMissing = (e) => !!e && (['PGRST205', 'PGRST202', '42P01', '42883'].includes(e.code) || /could not find the (table|function)|does not exist/i.test(e.message || ''));

async function run(p) {
  try {
    const r = await p;
    if (r.error) return { data: null, missing: isMissing(r.error), error: r.error };
    return { data: r.data, missing: false, error: null };
  } catch (e) { return { data: null, missing: false, error: e }; }
}

export const isLive = (o, now = Date.now()) => !!o.is_active
  && (!o.valid_from || new Date(o.valid_from).getTime() <= now)
  && (!o.valid_until || new Date(o.valid_until).getTime() >= now);

export async function getOffers(limit = 50) {
  const r = await run(supabase.from('offers').select('*').eq('is_active', true)
    .order('valid_until', { ascending: true, nullsFirst: false }).limit(limit));
  return r.data ? { ...r, data: r.data.filter((o) => isLive(o)) } : r;
}

export async function getReferral() {
  const r = await run(supabase.rpc('referral_overview'));
  if (r.data && r.data.ok === false) return { data: null, missing: false, error: new Error('Please sign in.') };
  return r;
}
export const registerReferral = (username) => run(supabase.rpc('register_referral', { p_username: username }));

export async function getVip() {
  const [m, a, e] = await Promise.all([
    run(supabase.from('vip_memberships').select('*').maybeSingle()),
    run(supabase.from('vip_applications').select('id, status, reject_reason, created_at, reviewed_at, amount_php').order('created_at', { ascending: false }).limit(1)),
    run(supabase.from('vip_entitlements').select('*').order('created_at', { ascending: false })),
  ]);
  const missing = m.missing || a.missing || e.missing;
  const error = m.error || a.error || e.error;
  return { data: { membership: m.data, application: a.data && a.data[0] ? a.data[0] : null, entitlements: e.data || [] }, missing, error };
}
export const submitVipApplication = (v) => run(supabase.rpc('submit_vip_application', { p_url: v.url, p_public_id: v.publicId, p_reference: v.reference || '', p_note: v.note || '' }));
