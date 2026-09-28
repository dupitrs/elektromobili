/* Browser regression checks. Uses an existing Playwright installation:
   PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-mobile.cjs chromium
   The local server supports byte ranges so Safari can decode/seek the MP4. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const engine = process.argv[2] || 'chromium';
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.mp4':'video/mp4' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const size = fs.statSync(file).size, range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  const start = range ? Number(range[1]) : 0, end = range && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  res.writeHead(range ? 206 : 200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges':'bytes', 'Content-Length':end-start+1, ...(range ? {'Content-Range':`bytes ${start}-${end}/${size}`} : {}) });
  fs.createReadStream(file, {start,end}).pipe(res);
});
async function launch() {
  // Headless Linux GPU decoders vary by host; exercise the MP4 in software.
  if (engine !== 'webkit') return chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-accelerated-video-decode']});
  if (!process.env.WEBKIT_RUNTIME_LIBS) return webkit.launch({headless:true});
  const wk = path.join(path.dirname(webkit.executablePath()), 'minibrowser-wpe');
  return webkit.launch({headless:true,executablePath:wk+'/bin/MiniBrowser',env:{...process.env,WEBKIT_EXEC_PATH:wk+'/bin',WEBKIT_INJECTED_BUNDLE_PATH:wk+'/lib',WEBKIT_INSPECTOR_RESOURCES_PATH:wk+'/share',LD_LIBRARY_PATH:wk+'/lib:'+wk+'/sys/lib:'+process.env.WEBKIT_RUNTIME_LIBS}});
}
async function settle(page) { await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))); }
async function run() {
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await launch();
  try {
    for (const [width,height,touch] of [[390,844,true],[320,712,true],[430,932,true],[844,390,true],[1440,900,false]].filter(([width])=>!process.env.CHECK_WIDTH || width===Number(process.env.CHECK_WIDTH))) {
      const context = await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,deviceScaleFactor:touch?3:1});
      context.setDefaultTimeout(15000);
      // Keep these local UI checks independent of Google's cross-origin
      // embed scripts/network. The external map itself needs a live check.
      await context.route('https://maps.google.com/maps?**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Map test placeholder</title>'}));
      const page = await context.newPage(), errors = [];
      page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});
      page.on('console',msg=>{if(['warning','error'].includes(msg.type()))console.log(msg.type(),msg.text())});
      page.on('requestfailed',req=>{if(req.url().startsWith(url))console.log('REQUEST FAILED',req.url(),req.failure())});
      page.on('response',res=>{if(res.status()>=400)console.log('HTTP',res.status(),res.url())});
      // Observe layout/paint requests without exposing test hooks in production.
      await page.addInitScript(()=>{
        window.__layoutCount=0;window.__paints=[];
        document.addEventListener('erm:journeylayout',()=>window.__layoutCount++);
        const post = Worker.prototype.postMessage;
        Worker.prototype.postMessage=function(data,...rest){if(data.options)window.__paints.push({index:data.index,key:data.key,joined:!!data.backgroundURL});return post.call(this,data,...rest)};
      });
      await page.goto(url,{waitUntil:'domcontentloaded'});
      console.log(`${engine} ${width}: page loaded`);
      assert(await page.locator('#siteLoader').isVisible(),'loader not shown while scenes prepare');
      assert((await page.locator('#siteLoaderPercent').textContent()).endsWith('%'),'loader progress missing');
      if(width===390)await page.screenshot({path:`/tmp/site-loader-${engine}.png`});
      await page.waitForFunction(()=>document.querySelectorAll('.journey-band.is-painted').length===8 && document.querySelector('.years.is-3d-ready'),{},{timeout:45000}).catch(async error=>{console.log(await page.evaluate(()=>({paint:__paints,years:document.querySelector('.years')?.className,journey:document.querySelector('.garden-journey')?.className,bands:[...document.querySelectorAll('.journey-band')].map(e=>e.className)})));throw error});
      await page.waitForFunction(()=>document.getElementById('siteLoaderPercent')?.textContent==='100%',{},{timeout:30000});
      await page.locator('#siteLoader').waitFor({state:'hidden',timeout:30000});
      await page.waitForFunction(()=>!document.querySelector('video').paused && document.querySelector('video').currentTime>.05,{},{timeout:30000}).catch(async error=>{console.log(await page.locator('video').evaluate(v=>({paused:v.paused,time:v.currentTime,ready:v.readyState,network:v.networkState,error:v.error?.message,hidden:document.hidden})));throw error});
      await page.locator('#heroVideoToggle').click();
      assert(await page.locator('video').evaluate(v=>v.paused),'manual pause');
      await page.locator('#heroVideoToggle').click();
      await page.waitForFunction(()=>!document.querySelector('video').paused);
      if(touch)assert(await page.locator('#heroVideoToggle').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),'video control below first screen');
      const before = await page.evaluate(()=>({layouts:__layoutCount,paints:__paints.length,heights:[...document.querySelectorAll('.journey-band')].map(e=>e.offsetHeight)}));
      await page.evaluate(()=>scrollTo({top:850,behavior:'instant'}));await settle(page);
      // If the next animation frame is late, both road and train must still
      // move together during native scrolling, including Safari's compositor.
      const drift = await page.evaluate(()=>{
        const train=document.querySelector('.journey-guide canvas'),garden=document.querySelector('.journey-band');
        const before=train.getBoundingClientRect().top-garden.getBoundingClientRect().top;
        scrollTo({top:scrollY+90,behavior:'instant'});
        return Math.abs(train.getBoundingClientRect().top-garden.getBoundingClientRect().top-before);
      });
      assert(drift<1,`train left road between frames: ${drift}px`);
      if(touch){
        await page.evaluate(()=>{const section=document.querySelector('#pieredze');scrollTo({top:section.getBoundingClientRect().top+scrollY+section.offsetHeight/2-innerHeight*.34,behavior:'instant'})});
        await settle(page);
        if(width===390)await page.screenshot({path:`/tmp/train-content-${engine}.png`});
        assert.equal(await page.locator('.journey-guide canvas').evaluate(e=>getComputedStyle(e).opacity),'1','train disappeared over content');
        assert.equal(await page.locator('.journey-band.years-exit').evaluate(e=>getComputedStyle(e,'::after').display),'none','post-17 map has an entrance overlay');
        if(width===390)for(const id of ['ieklauts','apmeklejums','valodas','gadi','galerija','kontakti']){
          await page.evaluate(id=>{const s=document.getElementById(id);scrollTo({top:s.getBoundingClientRect().top+scrollY+s.offsetHeight/2-innerHeight*.34,behavior:'instant'})},id);
          await settle(page);
          const visible=await page.locator('.journey-guide canvas').evaluate(e=>{const r=e.getBoundingClientRect();return getComputedStyle(e).opacity!=='0'&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight});
          assert(visible,`train not visible in ${id}`);
        }
      }
      await page.evaluate(async()=>{
        const max=document.documentElement.scrollHeight-innerHeight;
        for(const target of [max,0,max,0]) {
          const from=scrollY;
          for(let n=1;n<=60;n++){scrollTo({top:from+(target-from)*n/60,behavior:'instant'});await new Promise(requestAnimationFrame)}
        }
      });
      await settle(page);
      const after = await page.evaluate(()=>({layouts:__layoutCount,paints:__paints.length,heights:[...document.querySelectorAll('.journey-band')].map(e=>e.offsetHeight),joined:__paints.filter(p=>p.index===4||p.index===5).every(p=>p.joined),overflow:document.documentElement.scrollWidth>innerWidth}));
      assert.deepEqual(after.heights,before.heights,'scroll changed garden heights');
      assert.equal(after.paints,before.paints,'scroll repainted/replaced a garden');
      assert(after.joined,'a temporary different garden was painted at a years join');
      assert(!after.overflow,'horizontal overflow');
      if(touch && width<768){
        await page.setViewportSize({width,height:height+90});await page.waitForTimeout(200);
        assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('.journey-band')].map(e=>e.offsetHeight)),before.heights,'toolbar resize changed gardens');
        assert.equal(await page.evaluate(()=>__paints.length),before.paints,'toolbar resize repainted gardens');
        await page.setViewportSize({width,height});
      }
      if(width===390) {
        for(const viewport of [{width:844,height:390},{width,height}]) {
          await page.setViewportSize(viewport);
          await page.waitForTimeout(300);
          await page.waitForFunction(()=>document.querySelectorAll('.journey-band.is-painted').length===8,{},{timeout:45000}).catch(async error=>{console.log('ROTATION',await page.evaluate(()=>({width:innerWidth,paint:__paints.slice(-12),journey:document.querySelector('.garden-journey')?.className,bands:[...document.querySelectorAll('.journey-band')].map(e=>e.className)})));throw error});
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'rotation overflow');
        }
      }
      await page.locator('#navToggle').isVisible().then(async visible=>{
        if(!visible)return;
        await page.locator('#navToggle').click();await page.locator('#siteNav a[href="#kontakti"]').click();
        await page.waitForTimeout(1400);
        assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'false');
        assert(Math.abs(await page.locator('#kontakti').evaluate(e=>e.getBoundingClientRect().top)-70)<40,'contact anchor missed');
      });
      await page.locator('.gal-item').first().click();await page.locator('#lightbox').waitFor({state:'visible'});
      await page.locator('#lbClose').click();await page.locator('#lightbox').waitFor({state:'hidden'});
      if(width===320){
        for(const code of ['de','ru','el','ja','lv']) {
          await page.locator('.lang-current').click();await page.locator(`[data-lang="${code}"]`).click();await page.waitForTimeout(250);
          assert.equal(await page.locator('html').getAttribute('lang'),code);
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${code} overflows`);
        }
      }
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(500);
      assert(await page.locator('#siteHeader').evaluate(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'),'header did not return to transparent');
      await page.screenshot({path:`/tmp/mobile-fixed-${engine}-${width}.png`});
      assert.deepEqual(errors,[],'page errors');
      console.log(`${engine} ${width}x${height}: video, scroll registration, stable gardens, navigation, gallery and overflow passed`);
      await context.close();
    }
    // A denied autoplay must leave a working explicit play button.
    const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    page.setDefaultTimeout(15000);
    await page.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;let allowed=false;document.addEventListener('click',()=>{allowed=true},true);HTMLMediaElement.prototype.play=function(){if(this.classList.contains('hero-video')&&!allowed)return Promise.reject(new DOMException('Blocked','NotAllowedError'));return play.call(this)}});
    await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForTimeout(500);
    await page.locator('#heroVideoToggle').click();await page.waitForFunction(()=>!document.querySelector('video').paused);
    await page.close();
    const reduced = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    reduced.setDefaultTimeout(15000);
    await reduced.goto(url,{waitUntil:'domcontentloaded'});
    await reduced.waitForFunction(()=>document.querySelector('.years.is-3d-ready'));
    assert(await reduced.locator('video').evaluate(v=>v.paused),'reduced motion must not autoplay');
    assert.equal(await reduced.locator('.journey-guide').evaluate(e=>getComputedStyle(e).display),'none');
    await reduced.locator('#heroVideoToggle').click();await reduced.waitForFunction(()=>!document.querySelector('video').paused);
    await reduced.close();
    console.log(`${engine}: blocked autoplay recovery and reduced motion passed`);
  } finally {await browser.close()}
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
