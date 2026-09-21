const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function createPng(width, height, getPixelRgba) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk('IHDR', ihdrData);

  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(1 + width * 4);
    line[0] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const offset = 1 + x * 4;
      line[offset] = r;
      line[offset + 1] = g;
      line[offset + 2] = b;
      line[offset + 3] = a;
    }
    scanlines.push(line);
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

function renderPinnaLogoPixel(x, y, w, h) {
  // Normalize coordinates to 0..1
  const u = x / w;
  const v = y / h;
  const cx = 0.5;
  const cy = 0.5;

  // 1. Squircle background test (Superellipse: |x-cx|^4 + |y-cy|^4 <= R^4)
  const dx = Math.abs(u - cx);
  const dy = Math.abs(v - cy);
  const rCorner = 0.44;
  const squircleDist = Math.pow(dx / rCorner, 4.4) + Math.pow(dy / rCorner, 4.4);

  if (squircleDist > 1.0) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Background color: deep dark forest gradient (#071513 to #0e2320)
  const bgR = Math.round(7 + 7 * (1 - v));
  const bgG = Math.round(21 + 14 * (1 - v));
  const bgB = Math.round(19 + 13 * (1 - v));

  // 2. Map Pin Marker Geometry:
  // Head center: (0.5, 0.48), radius: 0.28
  // Bottom point: (0.5, 0.83)
  const pinHeadCy = 0.47;
  const pinHeadR = 0.28;
  const pinDist = Math.hypot(u - 0.5, v - pinHeadCy);

  let inPin = false;
  if (pinDist <= pinHeadR && v <= pinHeadCy) {
    inPin = true;
  } else if (v > pinHeadCy && v <= 0.83) {
    // Tangent lines from bottom point (0.5, 0.83) to circle
    const progress = (v - pinHeadCy) / (0.83 - pinHeadCy);
    // Outer taper width
    const allowedW = pinHeadR * Math.cos(progress * 0.95) * (1 - Math.pow(progress, 1.4));
    if (Math.abs(u - 0.5) <= Math.max(0.015, allowedW)) {
      inPin = true;
    }
  }

  if (!inPin) {
    return [bgR, bgG, bgB, 255];
  }

  // Pin base color: Off-white / pale mint (#edf3f0)
  let pR = 237, pG = 243, pB = 240;

  // 3. Inside Triangle / Sector:
  // Apex at (0.5, 0.30), Bottom base at v ~ 0.58 .. 0.63 with curved arc
  const triApexY = 0.30;
  const triBaseY = 0.59;
  const triBottomArc = triBaseY + 0.04 * (1 - Math.pow((u - 0.5) / 0.17, 2));

  if (v >= triApexY && v <= triBottomArc) {
    const depth = (v - triApexY) / (triBaseY - triApexY);
    const halfWidth = depth * 0.165;
    if (Math.abs(u - 0.5) <= halfWidth) {
      // Dark pine forest green (#1d3f38)
      pR = 29;
      pG = 63;
      pB = 56;
    }
  }

  // 4. Glowing Orange Sun Beacon in center:
  // Center: (0.5, 0.46), radius: 0.06
  const sunDist = Math.hypot(u - 0.5, v - 0.46);
  if (sunDist <= 0.062) {
    // Orange beacon gradient (#f58529 to #d96510)
    const sunFactor = Math.max(0, Math.min(1, (0.062 - sunDist) / 0.062));
    pR = Math.round(245 - 28 * (1 - sunFactor));
    pG = Math.round(133 - 32 * (1 - sunFactor));
    pB = Math.round(41 - 25 * (1 - sunFactor));
  }

  return [pR, pG, pB, 255];
}

['public/icon-192.png', 'public/icon-512.png', 'public/apple-touch-icon.png', 'public/favicon.png'].forEach(file => {
  let size = 192;
  if (file.includes('512')) size = 512;
  if (file.includes('180') || file.includes('apple')) size = 180;
  if (file.includes('favicon')) size = 48;
  const png = createPng(size, size, renderPinnaLogoPixel);
  fs.writeFileSync(file, png);
  console.log(`Generated ${file} (${size}x${size}, ${png.length} bytes)`);
});
