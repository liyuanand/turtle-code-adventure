const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('**/api/game/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
  await page.goto(process.env.GAME_URL||'http://localhost:8765');
  await page.evaluate(()=>{document.querySelector('#guideModal').classList.add('hidden');state.sound=false});
  async function visible(selector){
   await page.waitForFunction(selector=>{const r=document.querySelector(selector)?.getBoundingClientRect();return r&&(r.height>innerHeight ? r.top<=0&&r.bottom>=innerHeight : r.top>=-1&&r.bottom<=innerHeight+1)},selector);
  }
  for(const width of [375,390,844]){
   await page.setViewportSize({width,height:width===844?390:844});
   // Exercise real click handlers, not direct calls to the run function.
   for(const button of ['#mobileRunBtn']){
    await page.evaluate(()=>{selectLevel(4);program=[0,1,2,3,4,5].map(i=>({...level().commands[i]}));renderProgram()});
    await page.locator(button).click();
    await page.waitForFunction(()=>running);
    await visible('#gameCanvas');
    await page.waitForFunction(()=>!running);
    await page.evaluate(()=>document.querySelectorAll('.modal-backdrop').forEach(e=>e.classList.add('hidden')));
   }
   {
    const button = '#mobileRunBtn';
    await page.evaluate(()=>{selectLevel(5);challengeState.selected=challengeRound().correct.slice();renderChallengePanel()});
    await page.locator(button).click();
    await page.waitForFunction(()=>challengeState.awaitingInput);
    await visible('.runtime-console');
    await page.locator('#runtimeNameInput').fill('测试同学');
    await page.locator('.runtime-continue-btn').click();
    await page.waitForFunction(()=>challengeState.battle);
    await visible('.lesson-painting');
    // Leave this level before its normal victory timer opens the completion dialog.
    await page.evaluate(()=>selectLevel(6));
    for(let index=6;index<10;index++){
     await page.evaluate(i=>{selectLevel(i);challengeState.selected=challengeRound().correct.slice();renderChallengePanel()},index);
     await page.locator('[data-challenge-run]').click();
     await page.waitForFunction(()=>challengeState.roundPassed);
     await visible('.lesson-painting');
     await page.locator('[data-challenge-run]').click();
     await page.waitForFunction(()=>challengeState.stage===1);
     await visible('.lesson-painting');
    }
   }
  }
  const order=()=>page.locator('[data-challenge-card]').evaluateAll(es=>es.map(e=>e.dataset.challengeCard));
  for(let levelIndex=10;levelIndex<16;levelIndex++){
   await page.evaluate(i=>selectLevel(i),levelIndex);const positions=[];
   for(let stage=0;stage<3;stage++){
    const before=await order();const correct=await page.evaluate(()=>challengeRound().correct[0]);positions.push(before.indexOf(correct));
    const wrong=before.find(id=>id!==correct);
    await page.locator(`[data-challenge-card="${wrong}"]`).click();assert.deepEqual(await order(),before);
    await page.locator('[data-challenge-run]').click();await page.waitForFunction(()=>!challengeState.presenting);assert.deepEqual(await order(),before);assert(!await page.evaluate(()=>challengeState.roundPassed));
    await page.locator(`[data-challenge-card="${correct}"]`).click();assert.deepEqual(await order(),before);
    await page.locator('[data-challenge-run]').click();await page.waitForFunction(()=>challengeState.roundPassed);assert.deepEqual(await order(),before);
    if(stage<2)await page.evaluate(()=>advanceChallenge());
   }
   assert.deepEqual(positions.slice().sort(),[0,1,2]);
  }
  const seededOrders=[];
  for(const sample of [0,.999]){
   await page.evaluate(sample=>{const random=Math.random;try{Math.random=()=>sample;selectLevel(10)}finally{Math.random=random}},sample);
   seededOrders.push(await order());
  }
  assert.notDeepEqual(...seededOrders);
  console.log('PASS: real mobile toolbar and task button clicks auto-focus levels 5–10 in three mobile viewports; runtime input and result; next stage; all 18 RPG questions use balanced shuffled answer positions; order stable through selection, wrong answer and success; fresh entry reshuffles.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
