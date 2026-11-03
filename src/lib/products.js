// Edit price (in pesos, e.g. 199) and image (a Cloudinary URL) for each flavor. Leave null if not ready.
export const PRODUCTS = [
  { id: 'fraise', name: 'Fraise Dorée', kind: 'Strawberry extract', desc: 'A delicate strawberry-extract flavor with a sweet, fruity character.', price: null, image: null,
    more: [['Flavor', 'Strawberry, sweet and fruity'], ['Type', 'Strawberry-extract graham bites']] },
  { id: 'amande', name: 'Amande Dorée', kind: 'Almond extract', desc: 'A delightful almond-extract flavor with a distinctive nutty aroma.', price: null, image: null,
    more: [['Flavor', 'Almond, nutty aroma'], ['Type', 'Almond-extract']] },
  { id: 'jade', name: 'Jade Élixir', kind: 'Matcha-coated', desc: 'A matcha-coated creation with an elegant, signature green tea taste.', price: null, image: null,
    more: [['Flavor', 'Matcha green tea'], ['Type', 'Matcha-coated']] },
  { id: 'rose', name: 'Rosé Élixir', kind: 'Strawberry-coated', desc: 'A strawberry-coated delight with a beautiful fruity finish.', price: null, image: null,
    more: [['Flavor', 'Strawberry, fruity finish'], ['Type', 'Strawberry-coated']] },
  { id: 'noir', name: 'Premium Noir Élixir', kind: 'Chocolate-coated', desc: 'Chocolate-coated indulgence for those who love rich chocolate flavor.', price: null, image: null,
    more: [['Flavor', 'Rich chocolate'], ['Type', 'Chocolate-coated']] },
  { id: 'blanc', name: 'Blanc Élixir', kind: 'White chocolate-coated', desc: 'White chocolate-coated goodness with a smooth, creamy sweetness.', price: null, image: null,
    more: [['Flavor', 'Creamy white chocolate'], ['Type', 'White chocolate-coated']] },
];
export const peso = (p) => (p === null || p === undefined || p === '' ? null : '₱' + Number(p).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
