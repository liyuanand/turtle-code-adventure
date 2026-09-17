const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel:'chrome', headless:true });
  try {
    const page = await browser.newPage({ viewport:{ width:390, height:844 } });
    let releaseFirst, releaseSecond;
    const first = new Promise(resolve => releaseFirst = resolve);
    const second = new Promise(resolve => releaseSecond = resolve);
    await page.route('**/dragon-3.webp*', async route => { await first; await route.continue(); });
    await page.route('**/dragon-4.webp*', async route => { await second; await route.continue(); });
    await page.goto(process.env.GAME_URL || 'http://localhost:8765');
    await page.evaluate(() => { document.querySelector('#guideModal').classList.add('hidden'); selectLevel(15); startRpgCutscene(() => {}); });
    await page.waitForTimeout(5100);
    assert.equal(await page.evaluate(() => cutsceneFrame), 0);
    assert.equal(await page.evaluate(() => cutsceneTimer), null);
    assert(await page.locator('#rpgCutscene').evaluate(e => e.classList.contains('art-loading')));
    releaseFirst();
    await page.waitForFunction(() => !document.querySelector('#rpgCutscene').classList.contains('art-loading'));
    assert.notEqual(await page.evaluate(() => cutsceneTimer), null);
    await page.locator('#cutsceneNextBtn').click();
    assert(await page.locator('#rpgCutscene').evaluate(e => e.classList.contains('art-loading')));
    await page.evaluate(() => finishCutscene());
    releaseSecond();
    await page.evaluate(async () => { const image = new Image(); image.src = rpgArtworkUrl(1); await image.decode(); });
    assert.equal(await page.evaluate(() => cutsceneTimer), null);
    assert(await page.locator('#cutsceneModal').evaluate(e => e.classList.contains('hidden')));
    console.log('PASS: slow images cannot auto-skip a story frame; closing cancels pending image callbacks.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
