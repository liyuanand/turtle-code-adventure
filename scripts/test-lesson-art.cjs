const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/api/game/**',route=>route.fulfill({status:200,contentType:'application/json',body:'{}'}));
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.GAME_URL||'http://localhost:8765');
  await page.evaluate(()=>{document.querySelector('#guideModal').classList.add('hidden');state.sound=false});
  const expectedConfig=process.env.BASELINE_HTML;
  if(expectedConfig){const baseline=fs.readFileSync(expectedConfig,'utf8');const current=fs.readFileSync('index.html','utf8');const start=baseline.indexOf('    const GAME_CONFIG =');const end=baseline.indexOf('    const ',start+10);assert(current.includes(baseline.slice(start,end)),'Entire lesson config must be unchanged');}
  for(let index=0;index<5;index++){
   await page.evaluate(index=>selectLevel(index),index);
   await page.waitForFunction(()=>lessonArtwork(`level-${currentLevel+1}-world`)&&lessonArtwork('turtle-sprite'));
   if([0,1].includes(index)){
    // Solve the unchanged maze through its public instruction set, including step assignment.
    const solution=await page.evaluate(()=>{
     const initial={...level().start,step:1,path:[]};const queue=[initial],seen=new Set();
     while(queue.length){const s=queue.shift(),key=[s.x,s.y,s.dir,s.step].join();if(seen.has(key))continue;seen.add(key);
      if(s.x===level().end.x&&s.y===level().end.y)return s.path;
      if(s.path.length>=level().maxCommands)continue;
      level().commands.forEach((c,i)=>{const n={...s,path:[...s.path,i]};if(c.type==='left')n.dir=(n.dir+3)%4;else if(c.type==='right')n.dir=(n.dir+1)%4;else if(c.type==='setVar')n.step=c.value;else {const distance=c.type==='forwardVar'?n.step:c.value;const dx=[0,1,0,-1][n.dir],dy=[-1,0,1,0][n.dir];for(let k=0;k<distance;k++){n.x+=dx;n.y+=dy;if(!isOpen(n.x,n.y))return;}}queue.push(n)});
     }throw Error('No route');
    });
    await page.evaluate(async solution=>{program=solution.map(i=>({...level().commands[i]}));await runProgram()},solution);
    assert(await page.evaluate(()=>state.completed[currentLevel]));
   }else if(index===2||index===3){
    await page.evaluate(async()=>{program=[{...level().commands[0]}];await runProgram()});
    assert(!(await page.evaluate(()=>state.completed[currentLevel])),'Wrong default drawing must still fail');
    await page.evaluate(async()=>{if(currentLevel===2){changeParameter('loops',1);changeParameter('angle',54)}else{changeParameter('loops',1);changeParameter('increment',4)}await runProgram()});
    assert(await page.evaluate(()=>state.completed[currentLevel]));
    assert(await page.evaluate(()=>sketchSegments.length>0));
   }else{
    await page.evaluate(async()=>{program=[0,1,2,3,4,5].map(i=>({...level().commands[i]}));await runProgram()});
    assert.equal(await page.evaluate(()=>collected.size),3);assert(await page.evaluate(()=>state.completed[currentLevel]));
   }
   await page.evaluate(()=>{document.querySelector('#completeModal').classList.add('hidden');document.querySelector('#nameModal').classList.add('hidden')});
  }
  await page.evaluate(()=>selectLevel(5));
  await page.evaluate(async()=>{challengeState.selected=challengeRound().correct.slice();await runChallengeRound()});
  assert(await page.evaluate(()=>challengeState.awaitingInput));
  await page.evaluate(()=>submitRuntimeInput(''));
  assert(await page.evaluate(()=>challengeState.awaitingInput));
  await page.evaluate(()=>submitRuntimeInput('小明'));
  assert(await page.evaluate(()=>challengeState.battle));
  assert((await page.evaluate(()=>challengeState.lastConsole)).includes("name = '小明'\n*\n**\n****"));
  await page.locator('.lesson-painting img').evaluate(e=>e.decode());
  assert((await page.locator('.lesson-painting img').getAttribute('src')).includes('level-6-victory'));
  await page.waitForTimeout(950);await page.evaluate(()=>{document.querySelector('#completeModal').classList.add('hidden');document.querySelector('#nameModal').classList.add('hidden')});
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   for(let index=6;index<10;index++){
    await page.evaluate(i=>selectLevel(i),index);
    for(let stage=0;stage<3;stage++){
     await page.locator('.lesson-painting img').evaluate(e=>e.decode());
     const before=await page.locator('.lesson-painting img').getAttribute('src');
     await page.evaluate(async()=>{challengeState.selected=[];await runChallengeRound()});
     assert.equal(await page.locator('.lesson-painting img').getAttribute('src'),before);
     await page.evaluate(async()=>{challengeState.selected=challengeRound().correct.slice();await runChallengeRound()});
     assert(await page.evaluate(()=>challengeState.roundPassed));
     await page.locator('.lesson-painting img').evaluate(e=>e.decode());
     assert.notEqual(await page.locator('.lesson-painting img').getAttribute('src'),before);
     const geometry=await page.evaluate(()=>{let art=document.querySelector('.lesson-painting img').getBoundingClientRect(),caption=document.querySelector('.lesson-painting figcaption').getBoundingClientRect(),lab=document.querySelector('#missionLab').getBoundingClientRect();return {art:art.bottom,caption:caption.top,end:caption.bottom,lab:lab.bottom,overflow:document.documentElement.scrollWidth>innerWidth}});
     assert(geometry.caption>=geometry.art&&geometry.end<=geometry.lab&&!geometry.overflow);
     if(stage<2)await page.evaluate(()=>advanceChallenge());
    }
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: original curriculum; maze routes and variable steps; incorrect/correct loop drawings; coordinate badges; runtime input and triangle output; 24 story transitions; wrong-answer artwork; desktop/mobile layout.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
