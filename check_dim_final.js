import fs from 'fs';
function getDim(file) {
  const b = fs.readFileSync(file);
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  return {w, h};
}
console.log('192:', getDim('public/app-icon-192.png'));
console.log('512:', getDim('public/app-icon-512.png'));
