import { Cookie, Crown, Gamepad2, Gift, Landmark, ShoppingBag, Smartphone, Ticket, Wallet } from 'lucide-react';

const ICONS = [
  [/load/i, Smartphone],
  [/gcash|maya/i, Wallet],
  [/bank/i, Landmark],
  [/garena|voucher|coupon|ticket/i, Ticket],
  [/treat|snack|sweet|chocolate/i, Cookie],
  [/perk|vip|premium|special/i, Crown],
  [/legends|farlight|free fire|pubg|roblox|valorant|rift|honor|game/i, Gamepad2],
  [/shop|merch|bag|apparel/i, ShoppingBag],
];
// Categories listed here show first, in this order. Edit freely.
const FIRST = ['Load', 'GCash', 'Maya', 'Bank Credit', 'YUÉLÍN Treats', 'YUÉLÍN Perks'];

export const catIcon = (name) => { const m = ICONS.find(([re]) => re.test(name)); return m ? m[1] : Gift; };
export const catName = (r) => (r.category && String(r.category).trim()) || 'Other';
export const soldOut = (r) => r.stock !== null && r.stock !== undefined && r.stock <= 0;
const rank = (n) => { if (n === 'Other') return 999; const i = FIRST.indexOf(n); return i === -1 ? 100 : i; };

export function groupRewards(list) {
  const m = new Map();
  [...list].sort((a, b) => a.cost_points - b.cost_points).forEach((r) => {
    const k = catName(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  });
  return [...m.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([name, items]) => ({ name, items, min: items[0].cost_points }));
}

export function nextGoal(list, bal) {
  return [...list].filter((r) => !soldOut(r)).sort((a, b) => a.cost_points - b.cost_points).find((r) => r.cost_points > bal) || null;
}
