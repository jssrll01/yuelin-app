import sharp from 'sharp';
import fs from 'node:fs';
const defs = `<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e08f"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#8a6d12"/></linearGradient>
<radialGradient id="b" cx=".5" cy=".38" r=".85"><stop offset="0" stop-color="#232326"/><stop offset="1" stop-color="#050505"/></radialGradient></defs>`;
const mark = `<g fill="none" stroke="url(#g)" stroke-linecap="round" stroke-linejoin="round"><path d="M150 150 L256 282 L362 150" stroke-width="42"/><path d="M256 282 V398" stroke-width="42"/></g><path d="M256 66 L284 98 L256 130 L228 98 Z" fill="url(#g)"/>`;
const standard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<rect width="512" height="512" rx="112" fill="url(#b)"/><circle cx="256" cy="256" r="226" fill="none" stroke="url(#g)" stroke-width="6"/>${mark}</svg>`;
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}<rect width="512" height="512" fill="url(#b)"/><g transform="translate(256 256) scale(.7) translate(-256 -256)">${mark}</g></svg>`;
fs.writeFileSync('public/icon.svg', standard);
const out = async (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png().toFile('public/' + file);
await out(standard, 192, 'icon-192.png');
await out(standard, 512, 'icon-512.png');
await out(maskable, 192, 'icon-maskable-192.png');
await out(maskable, 512, 'icon-maskable-512.png');
await out(standard, 180, 'apple-touch-icon.png');
await out(standard, 32, 'favicon-32.png');
console.log('OK: icons written to public/');
