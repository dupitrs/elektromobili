const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto(process.env.YEARS_PREVIEW_URL || 'http://127.0.0.1:8010', { waitUntil: 'domcontentloaded' });
    const directory = resolve(__dirname, '../assets/img/journey');
    mkdirSync(directory, { recursive: true });
    const result = await page.evaluate(async () => (await import('/assets/js/journey-bake.js')).bakeGardenDecor());
    const data = Buffer.from(result.image.split(',')[1], 'base64');
    writeFileSync(resolve(directory, 'decor.webp'), data);
    writeFileSync(resolve(directory, 'decor.json'), JSON.stringify(result.metadata) + '\n');
    console.log('Garden decorations: ' + Math.round(data.length / 1024) + ' KB');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
