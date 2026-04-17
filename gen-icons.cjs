// Generate simple PNG icons without external dependencies
const fs = require('fs');
const zlib = require('zlib');

function createPNG(size, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  // IHDR chunk: width, height, bitDepth=8, colorType=2 (RGB), compress=0, filter=0, interlace=0
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; ihdrData[9] = 2;
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data: each row = filter byte (0) + RGB pixels
  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(size * rowSize);
  for (let y = 0; y < size; y++) {
    const base = y * rowSize;
    raw[base] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const off = base + 1 + x * 3;
      // Rounded rect look: corners are white, center is the color
      const cx = x - size / 2, cy = y - size / 2;
      const radius = size * 0.22;
      const bx = Math.abs(cx) - (size / 2 - radius);
      const by = Math.abs(cy) - (size / 2 - radius);
      const dist = Math.sqrt(Math.max(0, bx) ** 2 + Math.max(0, by) ** 2);
      if (dist > radius) {
        raw[off] = 255; raw[off+1] = 255; raw[off+2] = 255;
      } else {
        raw[off] = r; raw[off+1] = g; raw[off+2] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type);
  const crcBuf = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeB, data, crc]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

// Blue: #007AFF
const [r, g, b] = [0, 122, 255];

fs.writeFileSync('public/icon-192.png', createPNG(192, r, g, b));
fs.writeFileSync('public/icon-512.png', createPNG(512, r, g, b));
console.log('Icons generated: public/icon-192.png, public/icon-512.png');
