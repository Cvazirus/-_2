import fs from 'fs';
function getPngDimensions(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(0,8).toString('hex') !== '89504e470d0a1a0a') {
    return 'Not a PNG';
  }
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return `${width}x${height}`;
}
console.log('192:', getPngDimensions('public/icon-192.png'));
console.log('512:', getPngDimensions('public/icon-512.png'));
