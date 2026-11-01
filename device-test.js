#!/usr/bin/env node
/* Polaris One · device test
   Phone, tablet and desktop emulation (no phone needed):
       node tools/device-test.js                 → opens index.html next to this folder
       node tools/device-test.js https://your.site/polaris-one/index.html
   A real Android phone (USB debugging on, Chrome open on the phone, cable to this computer):
       adb forward tcp:9222 localabstract:chrome_devtools_remote
       node tools/device-test.js --android
   For every device it logs in with the demo account and checks that nothing scrolls sideways, that no page error appears,
   that buttons are big enough to tap, and it saves a picture per page to tools/device-shots/. Exit code 1 if something fails. */
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/npm-tools/node_modules/playwright'); }
const { chromium, devices } = pw;
const args = process.argv.slice(2), android = args.includes('--android');
const target = args.find(a => /^https?:|^file:/.test(a)) || 'file://' + path.resolve(__dirname, '..', 'index.html');
const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;
const DEV = [['iPhone 13', devices['iPhone 13']], ['Pixel 7', devices['Pixel 7']], ['iPad (gen 7)', devices['iPad (gen 7)']], ['Galaxy Tab S4', devices['Galaxy Tab S4']], ['Laptop 1366', { viewport: { width: 1366, height: 768 } }]];
const PAGES = [['One day', 'execute', 'daily'], ['Activities', 'execute', 'activities'], ['Planning', 'plan', 'planning'], ['Time log', 'execute', 'timelog'], ['Healthcare', 'health', null], ['Connections', 'integrations', 'gallery'], ['Settings', 'settings', 'data']];
let fails = 0; const ok = (c, m, x) => { if (c) console.log('  ok  ', m); else { fails++; console.log('  FAIL', m, x === undefined ? '' : JSON.stringify(x)); } };
const shots = path.resolve(__dirname, 'device-shots'); fs.mkdirSync(shots, { recursive: true });
async function runOn(name, page, errs) {
  console.log('\n' + name);
  await page.goto(target); await page.waitForSelector('[data-act=demologin]', { timeout: 20000 });
  await page.click('[data-act=demologin][data-e="admin@demo.app"]'); await page.waitForSelector('#top h1', { timeout: 20000 }); await page.waitForTimeout(500);
  for (const [label, a, b] of PAGES) {
    await page.evaluate(([a, b]) => { try { b ? go(a, b) : go(a) } catch (e) { } }, [a, b]); await page.waitForTimeout(450);
    const r = await page.evaluate(() => { const w = document.documentElement.clientWidth, over = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > w + 2 && !e.closest('[style*="overflow"],.tbl,table,pre,code,.scroll,.tabs,.pills,.subnav,.gantt,.board') && getComputedStyle(e).position !== 'fixed' }).length;
      const small = [...document.querySelectorAll('#view button, #view .btn')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.height < 28 || b.width < 28) }).length;
      return { sideways: document.documentElement.scrollWidth - w, over, small } });
    ok(r.sideways <= 2, `${label}: the page does not scroll sideways`, r.sideways);
    ok(r.small === 0, `${label}: no tiny buttons (under 28 px)`, r.small);
    await page.screenshot({ path: path.join(shots, (name + '-' + label).replace(/[^A-Za-z0-9]+/g, '_') + '.png') });
  }
  ok(!errs.length, 'no page error', errs.slice(0, 3));
}
(async () => {
  if (android) {
    const browser = await chromium.connectOverCDP('http://localhost:9222'); const ctx = browser.contexts()[0]; const page = ctx.pages()[0] || await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message)); await runOn('Real Android phone', page, errs); await browser.close();
  } else {
    const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
    for (const [name, d] of DEV) {
      const ctx = await browser.newContext(Object.assign({}, d)); await ctx.route('**/*', r => { const u = r.request().url(); return /^(file|data|about|blob):/.test(u) || u.startsWith(target.split('/').slice(0, 3).join('/')) ? r.continue() : r.abort() });
      const page = await ctx.newPage(), errs = []; page.on('pageerror', e => errs.push(e.message)); await runOn(name, page, errs); await ctx.close();
    }
    await browser.close();
  }
  console.log(fails ? '\n' + fails + ' FAILED' : '\nALL PASSED'); process.exit(fails ? 1 : 0);
})();
