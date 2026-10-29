import { Coins, Gift, ShieldCheck, Ticket } from 'lucide-react';

const SINCE = '2026'; // EDIT: the year YUÉLÍN really started
export const BRAND = {
  name: 'YUÉLÍN',
  tagline: 'Rewards, refined.',
  since: SINCE,
  // EDIT: replace with your real story
  story: 'YUÉLÍN started in ' + SINCE + ' with a simple idea: make rewards clear, fair and easy to follow. Members redeem codes for points, then exchange those points for rewards from a curated collection.',
};

export const CAMPAIGNS = [
  { icon: Ticket, tag: 'Start here', title: 'Got a code? Cash it in.', text: 'Enter your YUÉLÍN code and your points land in your balance instantly.', cta: 'Redeem a code', to: '/redeem' },
  { icon: Gift, tag: 'The collection', title: 'Save toward something special.', text: 'Browse the reward collection and watch your progress bar fill with every point.', cta: 'See rewards', to: '/exchange' },
  { icon: Coins, tag: 'Clear value', title: '100 points. ₱1. No fine print.', text: 'A fixed, transparent rate means you always know exactly what your points are worth.', cta: 'How it works', to: '/guide' },
  { icon: ShieldCheck, tag: 'Peace of mind', title: 'Every point on the record.', text: 'Your points history shows what you earned and spent, and when.', cta: 'Learn more', to: '/about' },
];
