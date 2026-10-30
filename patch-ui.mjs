import fs from 'fs';

// Remove VIP badges
let vip = fs.readFileSync('src/pages/deal/VipDeal.jsx', 'utf8');
vip = vip.replace(/<div className="row between"><span className="ico"><b\.icon size=\{22\} aria-hidden="true" \/><\/span>[\s\S]*?<\/div>/g, '<div className="row"><span className="ico"><b.icon size={22} aria-hidden="true" /></span></div>');
fs.writeFileSync('src/pages/deal/VipDeal.jsx', vip);

// Remove Refer math table and bottom buttons
let refer = fs.readFileSync('src/pages/deal/ReferDeal.jsx', 'utf8');
refer = refer.replace(/<div className="list">\s*\{EXAMPLES\.map\(\(\[b, r\]\) => \([\s\S]*?\}\)\s*<\/div>/g, '');
refer = refer.replace(/<div className="row" style=\{\{ flexWrap: 'wrap' \}\}>\s*<Link to="\/how-it-works-deal"[\s\S]*?<\/div>/g, '');
fs.writeFileSync('src/pages/deal/ReferDeal.jsx', refer);

// Remove Offers bottom buttons
let offers = fs.readFileSync('src/pages/deal/OffersDeal.jsx', 'utf8');
offers = offers.replace(/<div className="row" style=\{\{ flexWrap: 'wrap' \}\}>\s*<Link to="\/home-deal#treats"[\s\S]*?<\/div>/g, '');
fs.writeFileSync('src/pages/deal/OffersDeal.jsx', offers);

// Remove How It Works bottom buttons
let how = fs.readFileSync('src/pages/deal/HowItWorksDeal.jsx', 'utf8');
how = how.replace(/<div className="row" style=\{\{ flexWrap: 'wrap' \}\}>\s*<Link to="\/redeem"[\s\S]*?<\/div>/g, '');
fs.writeFileSync('src/pages/deal/HowItWorksDeal.jsx', how);

// Remove About Deal bottom buttons
let about = fs.readFileSync('src/pages/deal/AboutDeal.jsx', 'utf8');
about = about.replace(/<div className="row" style=\{\{ flexWrap: 'wrap' \}\}>\s*<Link to="\/home-deal"[\s\S]*?<\/div>/g, '');
fs.writeFileSync('src/pages/deal/AboutDeal.jsx', about);
