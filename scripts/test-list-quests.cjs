const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/game/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
  await page.addInitScript(()=>localStorage.setItem('turtle-code-adventure-v1',JSON.stringify({progressVersion:2,unlocked:[0,10,15],stars:Array.from({length:16},(_,i)=>i===15?3:0),completed:Array.from({length:16},(_,i)=>i===15),sound:false,guideSeen:true})));
  await page.goto(process.env.GAME_URL||'http://localhost:8765');
  assert.equal(await page.locator('.level-tab').count(),21);
  const progress=await page.evaluate(()=>({stars:state.stars,completed:state.completed,unlocked:state.unlocked}));
  assert.equal(progress.stars.length,21);assert.equal(progress.stars[15],3);assert(progress.completed[15]);assert.deepEqual(progress.stars.slice(16),[0,0,0,0,0]);assert.deepEqual(progress.unlocked,[0,10,15]);
  for(let i=16;i<21;i++){
   await page.evaluate(i=>openPassword(i),i);await page.locator('#passwordInput').fill('1701');await page.locator('#passwordForm').evaluate(e=>e.requestSubmit());
   assert((await page.locator('#passwordError').innerText()).includes('口令不正确'));assert(!await page.evaluate(i=>state.unlocked.includes(i),i));
   await page.locator('#passwordInput').fill(['2018','2019','2020','2025','2026'][i-16]);await page.locator('#passwordForm').evaluate(e=>e.requestSubmit());
   assert(await page.evaluate(i=>state.unlocked.includes(i)&&currentLevel===i,i));
   assert(await page.locator('#passwordModal').evaluate(e=>e.classList.contains('hidden')));
  }
  const originalConfig=await page.evaluate(()=>JSON.stringify(GAME_CONFIG.levels));
  // Save correct Python snippets for an independent syntax audit.
  fs.writeFileSync('/tmp/list-quest-python.json',JSON.stringify(await page.evaluate(()=>GAME_CONFIG.levels.slice(16).flatMap(l=>l.stages.map(s=>s.rounds[0].cards.find(c=>c.id===s.rounds[0].correct[0]).label)))));
  await page.evaluate(()=>{playerProfile.pendingScores={};queueLeaderboardScore(11,3);queueLeaderboardScore(17,2);queueLeaderboardScore(21,3)});
  assert.deepEqual(await page.evaluate(()=>playerProfile.pendingScores),{'16':3,'17':2,'21':3});
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   for(let levelIndex=16;levelIndex<21;levelIndex++){
    await page.evaluate(i=>selectLevel(i),levelIndex);const slots=[],artwork=[];
    for(let stage=0;stage<3;stage++){
     const correct=await page.evaluate(()=>challengeRound().correct[0]);const ids=await page.locator('[data-challenge-card]').evaluateAll(es=>es.map(e=>e.dataset.challengeCard));slots.push(ids.indexOf(correct));
     const beforeArt=await page.locator('.quest-art-frame img').getAttribute('src');if(stage===0)artwork.push(beforeArt);
     await page.locator(`[data-challenge-card="${ids.find(id=>id!==correct)}"]`).click();await page.locator('[data-challenge-run]').click();await page.waitForFunction(()=>!challengeState.presenting);
     assert(!await page.evaluate(()=>challengeState.roundPassed));assert.equal(await page.locator('.quest-art-frame img').getAttribute('src'),beforeArt);
     await page.locator(`[data-challenge-card="${correct}"]`).click();await page.locator('[data-challenge-run]').click();
     const input=await page.evaluate(()=>challengeRound().listTask.input||null);
     if(input){
      await page.waitForFunction(()=>challengeState.awaitingInput);assert(!await page.evaluate(()=>challengeState.roundPassed));
      if(input==='append'){
       for(const [i,value] of ['12','3.5','-3'].entries())await page.locator(`[data-quest-field="entry${i}"]`).fill(value);
      }else{await page.locator('[data-quest-field="index"]').fill('3.5');if(input==='replace')await page.locator('[data-quest-field="value"]').fill('辅助')}
      await page.locator('[data-quest-input-form] button').click();assert((await page.locator('.quest-runtime-error').innerText()).includes('整数字符串'));assert(await page.evaluate(()=>challengeState.awaitingInput));
      if(input!=='append'){
       await page.locator('[data-quest-field="index"]').fill('3');await page.locator('[data-quest-input-form] button').click();assert((await page.locator('.quest-runtime-error').innerText()).includes('超出'));
       await page.locator('[data-quest-field="index"]').fill('2');
       if(input==='replace')await page.locator('[data-quest-field="value"]').fill('辅助');
      }else await page.locator('[data-quest-field="entry1"]').fill('0');
      await page.locator('[data-quest-input-form] button').click();
     }
     await page.waitForFunction(()=>challengeState.roundPassed);
     const result=await page.evaluate(()=>challengeState.questResult);
     const op=await page.evaluate(()=>challengeRound().listTask.op);
     if(levelIndex===16&&stage===0)assert.deepEqual(result.after,['医疗包',3,2.5,true]);
     if(levelIndex===16&&stage===2){assert.deepEqual(result.indices,[2]);assert(result.output.includes('地图'))}
     if(levelIndex===17){assert.deepEqual(result.after,stage===1?['木块','铁块','钻石']:['石块','铁块','金块']);assert.equal(result.before.length,6)}
     if(levelIndex===18&&stage===1)assert.deepEqual(result.after,['战士','射手','辅助']);
     if(op==='random'){assert.equal(result.colors.length,6);assert(result.colors.every(c=>['red','gold','cyan'].includes(c)));assert.equal(await page.locator('.quest-firework line').count(),6)}
     if(op==='append'){assert.deepEqual(result.before,[]);assert.deepEqual(result.after,[12,0,-3]);assert.equal(result.trace.length,3)}
     if(op==='traverse')assert.equal(result.output,'彩虹门\n弹跳板\n终点');
     if(op==='count')assert(result.output.includes('→ 3'));
     if(op==='pop'){assert.deepEqual(result.after,['瓶子炮','太阳花']);assert.equal(result.removed,'冰冻星')}
     if(op==='arc'){assert.equal(result.arcs,2);assert(result.output.includes('2 × 2 = 4'));assert.equal(await page.locator('.quest-arcs path').count(),2)}
     const afterArt=await page.locator('.quest-art-frame img').getAttribute('src');assert.notEqual(afterArt,beforeArt);artwork.push(afterArt);
     if(process.env.CHECK_ART)await page.locator('.quest-art-frame img').evaluate(e=>e.decode());
     const geometry=await page.evaluate(()=>{const a=document.querySelector('.quest-art-frame').getBoundingClientRect(),d=document.querySelector('.list-task-panel').getBoundingClientRect();return{art:a.bottom,data:d.top,overflow:document.documentElement.scrollWidth>innerWidth,visible:a.top<innerHeight&&d.bottom>0}});
     assert(geometry.data>=geometry.art);assert(!geometry.overflow);if(width===390)assert(geometry.visible);
     if(stage<2)await page.locator('[data-challenge-run]').click();
    }
    assert.deepEqual(slots.sort(),[0,1,2]);assert.equal(new Set(artwork).size,4);
    if(process.env.CHECK_ART){
     await page.locator('[data-challenge-run]').click();await page.waitForFunction(()=>!document.querySelector('#cutsceneModal').classList.contains('hidden'));
     const frames=[];for(let i=0;i<3;i++){await page.waitForFunction(()=>!document.querySelector('#rpgCutscene').classList.contains('art-loading'));await page.evaluate(()=>clearTimeout(cutsceneTimer));frames.push(await page.locator('#rpgCutscene').evaluate(e=>e.style.getPropertyValue('--cutscene-art')));if(i<2)await page.locator('#cutsceneNextBtn').click()}
     assert.equal(new Set(frames).size,3);await page.evaluate(()=>{cutsceneDone=null;finishCutscene()});
    }
   }
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(GAME_CONFIG.levels)),originalConfig,'Operations must not mutate curriculum templates');assert.deepEqual(errors,[]);
  console.log('PASS: 21 levels; existing save preserved; lesson passwords verified; stable score IDs; 30 tasks; integer input errors/ranges; real list outputs; balanced options; mobile/desktop layout'+(process.env.CHECK_ART?'; all new art and 15 story frames loaded.':'.'));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
