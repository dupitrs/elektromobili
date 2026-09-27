// Requires Playwright and a local HTTP server for this repository.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {mkdirSync, writeFileSync} = require('node:fs');
const {resolve} = require('node:path');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/chromium',headless:true,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    await page.goto(process.env.YEARS_PREVIEW_URL || 'http://127.0.0.1:8010',{waitUntil:'domcontentloaded'});
    const backgroundOnly = process.argv.includes('--background-only');
    const result = await page.evaluate(async backgroundOnly => {
      const {bakeYears} = await import('/assets/js/years-bake.js');
      return bakeYears({ backgroundOnly });
    }, backgroundOnly);
    const directory = resolve(__dirname,'../assets/img/years');
    mkdirSync(directory,{recursive:true});
    for (const name of backgroundOnly ? ['background'] : ['background','car','trailer']) {
      const data = Buffer.from(result[name].split(',')[1],'base64');
      writeFileSync(resolve(directory,name+'.webp'),data);
      console.log(name+': '+Math.round(data.length/1024)+' KB');
    }
    if (result.metadata) writeFileSync(resolve(directory,'frames.json'),JSON.stringify(result.metadata)+'\n');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
