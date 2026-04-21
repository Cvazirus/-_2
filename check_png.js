import fs from 'fs';
const buf = fs.readFileSync('public/icon-192.png');
console.log('Hex signature:', buf.slice(0, 8).toString('hex'));
