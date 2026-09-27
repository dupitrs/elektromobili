#!/usr/bin/env node
/* Headless Chrome screenshot helper over raw CDP (no npm deps). Concurrency-safe.
   Usage:
     node scripts/shot.cjs --url <url> --out <file.png> [--width 1440] [--height 900]
       [--scrollTo "<css selector>"] [--eval "<js expression, may return a Promise>"]
       [--wait <ms after eval>] [--frames <n> --interval <ms>]  (frames → out-000.png, out-001.png …)
       [--clip "x,y,w,h"] [--dpr 1] [--reduced-motion] [--debug]
   Loads the page, waits for fonts + eager images, scrolls the element into view (block:center),
   runs --eval (e.g. "window.__visitWeather.strike({kind:'bolt', seed:3, hold:true})"),
   then writes one screenshot or a burst of frames. Exit code 1 on page errors. */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) { const k = a.slice(2); const v = process.argv[i + 1]; if (v === undefined || v.startsWith("--")) args[k] = true; else { args[k] = v; i++; } }
}
if (!args.url || !args.out) { console.error("need --url and --out"); process.exit(2); }
const dbg = (...a) => { if (args.debug) console.error("[dbg]", ...a); };
const width = +(args.width || 1440), height = +(args.height || 900), dpr = +(args.dpr || 1);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "shot-"));
const chrome = spawn("google-chrome", ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
  "--no-default-browser-check", "--mute-audio", "--user-data-dir=" + profile, "--remote-debugging-port=0",
  `--window-size=${width},${height}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
let wsUrl = null, errBuf = "", done = false;
const cleanup = () => { if (done) return; done = true; try { chrome.kill("SIGKILL"); } catch {} setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} }, 0); };
process.on("exit", cleanup);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => { cleanup(); process.exit(1); });
const fail = (m) => { console.error(m); cleanup(); process.exit(1); };
const watchdog = setTimeout(() => fail("watchdog: no result within 45 s"), 45000);
chrome.stderr.on("data", d => { errBuf += d; const m = errBuf.match(/DevTools listening on (ws:\/\/\S+)/); if (m && !wsUrl) { wsUrl = m[1]; dbg("ws", wsUrl); main().catch(e => fail(String(e && e.stack || e))); } });

async function main() {
  const host = wsUrl.split("/")[2];
  const targets = await (await fetch("http://" + host + "/json/list")).json();
  const page = targets.find(t => t.type === "page") || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });
  dbg("ws open");
  let id = 0; const pending = new Map(); const pageErrors = []; let loadedRes; const loaded = new Promise(r => { loadedRes = r; });
  ws.addEventListener("message", ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result); return; }
    if (msg.method === "Page.loadEventFired") loadedRes();
    if (msg.method === "Runtime.exceptionThrown") pageErrors.push(msg.params.exceptionDetails.text + " " + (msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description || ""));
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") pageErrors.push("console.error: " + msg.params.args.map(a => a.value || a.description).join(" "));
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: dpr, mobile: width < 768 });
  if (args["reduced-motion"]) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  dbg("navigate");
  await send("Page.navigate", { url: args.url });
  await Promise.race([loaded, new Promise(r => setTimeout(r, 15000))]);
  dbg("loaded");
  const evalJs = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error("eval failed: " + JSON.stringify(r.exceptionDetails)); return r.result.value; };
  await evalJs(`(async () => { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]); const eager = [...document.images].filter(i => !i.complete && i.loading !== 'lazy'); await Promise.race([Promise.all(eager.map(i => new Promise(r => { i.onload = i.onerror = r; }))), new Promise(r => setTimeout(r, 4000))]); await new Promise(r => setTimeout(r, 400)); })()`);
  dbg("assets ready");
  if (args.scrollTo) await evalJs(`(async () => { const el = document.querySelector(${JSON.stringify(args.scrollTo)}); if (!el) throw new Error("scrollTo target missing"); el.scrollIntoView({ block: "center" }); await new Promise(r => setTimeout(r, 900)); })()`);
  dbg("scrolled");
  if (args.eval) { const v = await evalJs(`(async () => { const __r = (${args.eval}); return await __r; })()`); if (v !== undefined) console.log("eval →", JSON.stringify(v)); }
  if (args.wait) await new Promise(r => setTimeout(r, +args.wait));
  const clip = args.clip ? (() => { const [x, y, w, h] = args.clip.split(",").map(Number); return { x, y, width: w, height: h, scale: 1 }; })() : undefined;
  const shot = async (file) => { const r = await send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: false }); fs.writeFileSync(file, Buffer.from(r.data, "base64")); console.log(file); };
  if (args.frames) { const n = +args.frames, interval = +(args.interval || 40); const base = args.out.replace(/\.png$/, ""); for (let i = 0; i < n; i++) { const t0 = Date.now(); await shot(`${base}-${String(i).padStart(3, "0")}.png`); const dt = Date.now() - t0; if (dt < interval) await new Promise(r => setTimeout(r, interval - dt)); } }
  else await shot(args.out);
  clearTimeout(watchdog);
  if (pageErrors.length) { console.error("PAGE ERRORS:\n" + pageErrors.join("\n")); cleanup(); process.exit(1); }
  cleanup(); process.exit(0);
}
