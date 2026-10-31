import { supabase } from '../supabase';

const MISSING = ['PGRST205', 'PGRST202', '42P01', '42883'];
export const isMissing = (e) => !!e && (MISSING.includes(e.code) || /could not find the (table|function)|does not exist/i.test(e.message || ''));

/** Call a Postgres function. Never throws. Returns { data, missing, error }. */
export async function call(name, args) {
  try {
    const r = await supabase.rpc(name, args || {});
    if (r.error) return { data: null, missing: isMissing(r.error), error: r.error };
    if (r.data && r.data.ok === false) return { data: r.data, missing: false, error: new Error(r.data.error || 'failed') };
    return { data: r.data, missing: false, error: null };
  } catch (e) { return { data: null, missing: false, error: e }; }
}
/** Await a supabase query builder. Never throws. */
export async function q(p) {
  try {
    const r = await p;
    if (r.error) return { data: null, missing: isMissing(r.error), error: r.error };
    return { data: r.data, missing: false, error: null };
  } catch (e) { return { data: null, missing: false, error: e }; }
}

export const STATUS = {
  pending: ['Pending', 'warn'], processing: ['Processing', 'warn'], fulfilled: ['Completed', 'ok'], completed: ['Completed', 'ok'],
  rejected: ['Rejected', 'bad'], cancelled: ['Canceled', 'bad'], canceled: ['Canceled', 'bad'],
};
export const statusOf = (s) => STATUS[String(s || '').toLowerCase()] || [s || 'Unknown', 'gold'];
export const isNew = (r) => !!r.created_at && Date.now() - new Date(r.created_at).getTime() < 14 * 864e5;
export const isFeatured = (r) => r.is_featured === true || r.featured === true;
export const ref = (r) => r.reference_code || r.reference || (r.id ? String(r.id).slice(0, 8).toUpperCase() : '');
