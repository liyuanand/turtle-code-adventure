// Run against a local HTTP server: NODE_PATH=/path/to/node_modules node scripts/test-game.cjs
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const url=process.env.GAME_URL||'http://localhost:8765';
 await p.addInitScript(()=>{if(!localStorage.getItem('migration-test-seeded')){
  localStorage.setItem('turtle-code-adventure-v1',JSON.stringify({unlocked:[0,5,10,12,14],stars:[3,2,1,0,0,2,0,0,0,1,1,2,3,2,1],completed:Array.from({length:15},(_,i)=>i===10||i===14),sound:false,guideSeen:true}));
  localStorage.setItem('migration-test-seeded','1');}});
 await p.goto(url);
 const snapshot=()=>p.evaluate(()=>({unlocked:state.unlocked,stars:state.stars,completed:state.completed,version:state.progressVersion,sound:state.sound}));
 const migrated=await snapshot();assert.equal(migrated.version,2);assert.deepEqual(migrated.unlocked,[0,5,11,13,15]);assert.equal(migrated.stars[10],0);assert.deepEqual(migrated.stars.slice(11),[1,2,3,2,1]);assert(migrated.completed[11]&&migrated.completed[15]);assert(!migrated.completed[10]);assert.equal(migrated.sound,false);
 await p.reload();assert.deepEqual(await snapshot(),migrated);
 assert.equal(await p.locator('.level-tab').count(),16);
 assert.equal(await p.evaluate(()=>GAME_CONFIG.levels.length*3),48);
 fs.writeFileSync('/tmp/game-code-audit.json',JSON.stringify(await p.evaluate(()=>GAME_CONFIG.levels.map(l=>({name:l.name,example:l.example,stages:l.stages?.map(s=>({code:s.code,rounds:s.rounds.map(r=>({mode:r.mode,cards:r.cards,correct:r.correct}))}))}))),null,2));
 await p.evaluate(()=>{playerProfile.pendingScores={11:2};queueLeaderboardScore(11,3);queueLeaderboardScore(12,3);});
 assert.deepEqual(await p.evaluate(()=>playerProfile.pendingScores),{'11':3,'16':3});
 const passwords=['2000','1010','2121','9712','1001','0729'];
 for(let i=0;i<6;i++){await p.evaluate(i=>openPassword(i+10),i);await p.locator('#passwordInput').fill(passwords[i]);await p.locator('#passwordForm').evaluate(e=>e.requestSubmit());assert.equal(await p.evaluate(()=>currentLevel),i+10);}
 await p.evaluate(()=>selectLevel(10));
 const initial=await p.locator('.rpg-battle-art').getAttribute('src');
 await p.locator('[data-challenge-card="micro-print"]').click();await p.locator('[data-challenge-run]').click();await p.waitForFunction(()=>challengeState.failedAttempts===1);assert.equal(await p.locator('.rpg-battle-art').getAttribute('src'),initial);
 for(const width of [375,390,844,1280]){
  const height=width===844?390:900;await p.setViewportSize({width,height});
  for(let l=10;l<16;l++){
   await p.evaluate(l=>selectLevel(l),l);const sources=[];
   for(let stage=0;stage<3;stage++){
    await p.locator('.rpg-battle-art').evaluate(e=>e.decode());
    const before=await p.locator('.rpg-battle-art').getAttribute('src');if(stage===0)sources.push(before);
    const id=await p.evaluate(()=>challengeRound().correct[0]);await p.locator(`[data-challenge-card="${id}"]`).click();await p.locator('[data-challenge-run]').click();await p.waitForFunction(()=>challengeState.roundPassed);await p.locator('.rpg-battle-art').evaluate(e=>e.decode());
    const after=await p.locator('.rpg-battle-art').getAttribute('src');assert.notEqual(after,before);sources.push(after);
    const layout=await p.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom}};return {hud:box('.rpg-battle-hud'),art:box('.rpg-battle-scene'),footer:box('.rpg-battle-footer'),outer:box('#canvasWrap'),battle:box('.rpg-battle'),overflow:document.documentElement.scrollWidth>innerWidth}});
    assert(layout.hud.bottom<=layout.art.top);assert(layout.footer.top>=layout.art.bottom);assert(layout.battle.bottom<=layout.outer.bottom);assert(!layout.overflow);
    if(width<=900)assert(layout.art.top>=0&&layout.art.bottom<=height);
    if(stage<2){await p.locator('[data-challenge-run]').click();assert.equal(await p.locator('.rpg-battle-art').getAttribute('src'),after);}
   }
   assert.equal(new Set(sources).size,4);
   if(width===390){
    await p.locator('[data-challenge-run]').click();await p.waitForFunction(()=>!document.querySelector('#cutsceneModal').classList.contains('hidden'));
    const frames=[];
    for(let frame=0;frame<3;frame++){
     const art=await p.locator('#rpgCutscene').evaluate(e=>e.style.getPropertyValue('--cutscene-art'));frames.push(art);
     await p.evaluate(async()=>{const im=new Image();im.src=rpgArtworkUrl(cutsceneFrame);await im.decode()});
     if(frame<2)await p.locator('#cutsceneNextBtn').click();
    }
    assert.equal(new Set(frames).size,3);
    await p.evaluate(()=>{clearTimeout(cutsceneTimer);cutsceneDone=null;document.querySelector('#cutsceneModal').classList.add('hidden')});
   }
  }
 }
 await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>selectLevel(10));
 await p.evaluate(async()=>{challengeState.selected=challengeRound().correct.slice();await Promise.all([runChallengeRound(),runChallengeRound()])});assert.equal(await p.evaluate(()=>challengeState.stage),0);assert(await p.evaluate(()=>challengeState.roundPassed));
 await p.evaluate(async()=>{advanceChallenge();challengeState.selected=challengeRound().correct.slice();const pending=runChallengeRound();selectLevel(11);await pending;});assert(!await p.evaluate(()=>challengeState.roundPassed));
 await p.evaluate(()=>selectLevel(10));await p.screenshot({path:'/tmp/microbit-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: migration and repeat reload; stable score IDs; six passwords; 72 battles; 4 unique battle frames and 3 story frames per boss; mobile visibility; no overlap/overflow; wrong answer; reduced motion and double-run guards.');
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
