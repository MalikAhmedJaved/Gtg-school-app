// Creates a minimal valid 1x1 PNG (67 bytes) for Expo prebuild
const fs = require('fs');
const path = require('path');

const MINIMAL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const outPath = path.join(__dirname, '..', 'assets', 'icon-prebuild.png');
const buffer = Buffer.from(MINIMAL_PNG_BASE64, 'base64');
fs.writeFileSync(outPath, buffer);
console.log('Created icon-prebuild.png', buffer.length, 'bytes');
