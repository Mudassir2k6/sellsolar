import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, '..', 'public');

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#eab308"/>
  <circle cx="256" cy="256" r="90" fill="#ffffff"/>
  <g stroke="#ffffff" stroke-width="28" stroke-linecap="round" fill="none">
    <path d="M256 80v48M256 384v48M80 256h48M384 256h48M128 128l34 34M350 350l34 34M128 384l34-34M350 162l34-34"/>
  </g>
</svg>`;

const ogSvg = fs.readFileSync(path.join(pub, 'og-image.svg'));

await sharp(ogSvg).resize(1200, 630).png().toFile(path.join(pub, 'og-image.png'));
await sharp(ogSvg).resize(1200, 630).jpeg({ quality: 90 }).toFile(path.join(pub, 'og-image.jpg'));

const icon = Buffer.from(iconSvg);
await sharp(icon).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));
await sharp(icon).resize(32, 32).png().toFile(path.join(pub, 'favicon-32x32.png'));
await sharp(icon).resize(16, 16).png().toFile(path.join(pub, 'favicon-16x16.png'));
await sharp(icon).resize(192, 192).png().toFile(path.join(pub, 'icon-192.png'));
await sharp(icon).resize(512, 512).png().toFile(path.join(pub, 'icon-512.png'));

// Multi-size ICO (16 + 32) via PNG containers — browsers accept PNG favicons; also copy 32 as favicon.ico fallback name
await sharp(icon).resize(32, 32).png().toFile(path.join(pub, 'favicon.ico'));

console.log('SEO image assets generated in /public');
