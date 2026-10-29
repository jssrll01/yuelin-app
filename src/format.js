export const pts = (n) => Number(n || 0).toLocaleString('en-PH');
export const peso = (p) => '₱' + (Number(p || 0) / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const when = (d) => new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
export const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
export const cleanPhone = (s) => String(s || '').replace(/[\s\-()]/g, '');
export const phoneOk = (s) => /^\+?\d{10,13}$/.test(cleanPhone(s));
export const money = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const day = (d) => (d ? new Date(d).toLocaleDateString('en-PH', { dateStyle: 'medium' }) : '');
