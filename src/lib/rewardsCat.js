import { Cookie, Gift, ShoppingBag, Smartphone, Sparkles, Ticket } from 'lucide-react';

const ICONS = [
  [/load|data|wifi|promo/i, Smartphone],
  [/voucher|coupon|gift ?card|ticket/i, Ticket],
  [/treat|snack|food|sweet|chocolate|cookie|candy/i, Cookie],
  [/shop|merch|bag|apparel/i, ShoppingBag],
  [/vip|premium|special/i, Sparkles],
];
export const catIcon = (name) => { const m = ICONS.find(([re]) => re.test(name)); return m ? m[1] : Gift; };
export const catName = (r) => (r.category && String(r.category).trim()) || 'Other';
export const soldOut = (r) => r.stock !== null && r.stock !== undefined && r.stock <= 0;

export function groupRewards(list) {
  const m = new Map();
  [...list].sort((a, b) => a.cost_points - b.cost_points).forEach((r) => {
    const k = catName(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  });
  return [...m.entries()]
    .sort((a, b) => (a[0] === 'Other') - (b[0] === 'Other') || a[0].localeCompare(b[0]))
    .map(([name, items]) => ({ name, items, min: items[0].cost_points }));
}

export function nextGoal(list, bal) {
  return [...list].filter((r) => !soldOut(r)).sort((a, b) => a.cost_points - b.cost_points).find((r) => r.cost_points > bal) || null;
}
