// Renders public/favicon.svg into the PNG icons the PWA manifest needs.
// Usage: pnpm icons   (requires Playwright + Chromium available locally)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const targets = [
  { file: 'public/icons/icon-192.png', size: 192, pad: 0 },
  { file: 'public/icons/icon-512.png', size: 512, pad: 0 },
  { file: 'public/icons/icon-512-maskable.png', size: 512, pad: 0.12, square: true },
  { file: 'public/apple-touch-icon.png', size: 180, pad: 0, square: true },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  const inner = Math.round(t.size * (1 - t.pad * 2));
  const art = t.square ? svg.replace('rx="112"', 'rx="0"') : svg;
  await page.setContent(
    `<html><body style="margin:0;display:grid;place-items:center;width:${t.size}px;height:${t.size}px;background:${t.square ? '#6F7CFA' : 'transparent'}">
      <div style="width:${inner}px;height:${inner}px">${art.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div>
    </body></html>`,
  );
  await page.screenshot({ path: t.file, omitBackground: !t.square });
  console.log('wrote', t.file);
}
await browser.close();
