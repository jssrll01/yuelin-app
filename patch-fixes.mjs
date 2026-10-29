import fs from 'fs';

// Remove "Create my account" from Guide.jsx
let guide = fs.readFileSync('src/pages/Guide.jsx', 'utf8');
guide = guide.replace(/<Link to="\/register" className="btn gold block">Create my account<\/Link>/, '');
fs.writeFileSync('src/pages/Guide.jsx', guide);

// Neutralize DealFooter across all pages
let parts = fs.readFileSync('src/components/deal/Parts.jsx', 'utf8');
parts = parts.replace(/export function DealFooter\(\) \{[\s\S]*?\n\}/, 'export function DealFooter() { return null; }');
fs.writeFileSync('src/components/deal/Parts.jsx', parts);

// Make Help Center Categories Horizontally Scrollable
let help = fs.readFileSync('src/pages/deal/HelpCenterDeal.jsx', 'utf8');
help = help.replace(/style=\{\{\s*flexWrap:\s*'wrap',\s*gap:\s*8\s*\}\}/, "style={{ flexWrap: 'nowrap', overflowX: 'auto', gap: 8, paddingBottom: 8, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}");
help = help.replace(/className=\{('btn sm' \+ \(cat < 0 \? ' gold' : ''\))\}/, "style={{ flexShrink: 0 }} className={$1}");
help = help.replace(/className=\{('btn sm' \+ \(cat === i \? ' gold' : ''\))\}/, "style={{ flexShrink: 0 }} className={$1}");
fs.writeFileSync('src/pages/deal/HelpCenterDeal.jsx', help);
