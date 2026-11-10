/* Four local motion-comic scenes. Competition counts are never inferred from awards. */
let comicTimer = null, comicGeneration = 0;
function stopComic() { clearTimeout(comicTimer); comicGeneration++; }
function stick(x, y, cls = '', scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="stick ${cls}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cy="-59" r="11"/><path d="M0 -46V-17"/><path class="arm left" d="M0 -39L-17 -24L-25 -35"/><path class="arm right" d="M0 -39L17 -24L25 -35"/><path class="leg left" d="M0 -17L-14 0L-25 0"/><path class="leg right" d="M0 -17L15 -2L26 0"/></g></g>`;
}
function trophy() { return '<g class="trophy" transform="translate(370 100)" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M-26-30H26V-8Q26 20 0 23Q-26 20-26-8Z"/><path d="M-26-23H-42V-8Q-42 7-23 7M26-23H42V-8Q42 7 23 7M0 23V47M-20 49H20"/><path d="m0-18 5 9 10 2-8 7 2 10-9-5-9 5 2-10-8-7 10-2Z" fill="currentColor" stroke-width="1"/></g>'; }
function svgScene(body) { return `<svg class="comic-art" viewBox="0 0 640 250" aria-hidden="true"><defs><pattern id="comic-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" opacity=".09"/></pattern></defs><path fill="url(#comic-grid)" d="M0 0H640V250H0Z"/>${body}</svg>`; }
function sceneSpec(round, choice, wish) {
  if (choice === null) return {
    title:'你的故事，仍在继续', type:'rest',
    captions:['这一站的成绩，可以稍后再记录。','编程勇士收好背包，准备走向下一站。','不必猜一个名次。带着好奇心，继续前行！'],
    art:svgScene('<path class="ground" d="M40 210H600"/>'+stick(180,205,'walker')+'<g class="gateway"><path d="M440 205V60H530V205"/><path d="M450 70H520V205H450Z" opacity=".15" fill="currentColor"/></g>')
  };
  if (round === 0) return {
    title:'探月杯 · 荣耀冲线', type:'race', result:['一等奖','二等奖','三等奖'][choice],
    captions:['5000 多人同场追梦，你也写下了自己的挑战故事。','开始冲刺！跨过卡壳的时刻，把每一次尝试变成向前的一步。',`冲线成功！你的探月杯${['一等奖','二等奖','三等奖'][choice]}，值得好好庆祝。`],
    art:svgScene('<path class="ground" d="M35 208H610"/><path class="track" d="M35 227H610M35 190H610"/><path class="finish-line" d="M515 70V225"/><text x="488" y="55">FINISH</text><g class="race-rivals" opacity=".28">'+stick(300,165,'runner',.7)+stick(440,165,'runner',.7)+'</g><g class="race-runner">'+stick(80,205,'runner')+'</g><g class="podium"><path d="M270 210V165H340V145H410V180H480V210"/><text x="352" y="198">'+['一','二','三'][choice]+'等奖</text>'+stick(300,164,'champion',.72)+trophy()+'</g>'),
    note:'5000 多人同场追梦 · 奖项按你的选择呈现。'
  };
  if (round === 1) {
    const pct=[10,20,30,50][choice];
    return {title:'选拔赛 · 星阶攀登',type:'rank',result:`年级前 ${pct}%`,
      captions:['排名是这一站的坐标。把努力化作向上的台阶！',`攀登中……你的赛场记录：年级前 ${pct}%。`,'点亮你的赛场印记！下一个目标，是再学会一个新本领。'],
      art:svgScene('<path class="stairs" d="M35 220H160V185H265V145H370V105H490V65H600"/><g class="climber">'+stick(85,215,'runner',.85)+'</g><g class="rank-beacon"><circle cx="490" cy="52" r="25"/><path d="m480 52 8 8 14-17"/></g><text x="350" y="220">年级前 '+pct+'%</text>'),
      extra:`<div class="rank-dots" aria-hidden="true">${Array.from({length:100},(_,i)=>`<i class="${i<pct?'lit':''}"></i>`).join('')}</div>`,note:'100 个光点展示所选排名比例，不代表真实参赛人数。'};
  }
  if (round === 2) {
    const variants=[
      {title:'创作实验室 · 我的游戏',type:'game',captions:['一个游戏世界，先从一个小小的想法开始。','编程勇士跳过平台、收集能量——角色、规则、得分逐个上线！','创作蓝图已点亮！下一步，一起写出第一个能玩的版本。'],art:svgScene('<path class="ground" d="M25 220H610"/><path class="platforms" d="M190 175H290M355 135H455M510 100H600"/><g class="game-player">'+stick(75,215,'runner',.8)+'</g><g class="coins" fill="currentColor"><circle cx="235" cy="125" r="10"/><circle cx="395" cy="85" r="10"/><circle cx="550" cy="50" r="10"/></g><text x="410" y="220" class="game-score">能量 +3</text>')},
      {title:'创作实验室 · 麻烦终结者',type:'software',captions:['重复的麻烦事，又排起了长队。','把任务交给程序！分类、整理，流程开始运转。','从一件生活小事出发，也能做出有用的软件。'],art:svgScene(stick(80,210,'operator')+'<g class="task-sheets"><path d="M180 70H225V130H180ZM245 95H290V155H245ZM175 150H220V210H175Z"/></g><g class="processor"><rect x="350" y="80" width="100" height="110" rx="10"/><text x="365" y="142">RUN</text></g><path class="flow" d="M290 135H340M460 135H515"/><g class="done-folder"><path d="M520 105H550L560 117H610V185H520Z"/><path d="m540 150 16 14 30-35"/></g>')},
      {title:'创作实验室 · AI 搭档',type:'ai',captions:['你提出想法，AI 搭档准备接收任务。','想一想、问一问，再检查：这个回答真的可靠吗？','点亮新搭档！用编程表达想法，用自己的判断把好关。'],art:svgScene(stick(150,215,'operator')+'<g class="ai-link"><path d="M225 125H385" stroke-dasharray="8 10"/><circle cx="270" cy="125" r="5" fill="currentColor"/></g><g class="robot"><rect x="410" y="70" width="100" height="100" rx="18"/><path d="M460 70V48M430 117H443M478 117H491M438 148H482"/><circle cx="460" cy="40" r="6"/></g><g class="verified"><circle cx="552" cy="185" r="24"/><path d="m538 185 10 10 18-23"/></g>')},
      {title:'创作实验室 · 你的独家蓝图',type:'blueprint',captions:['你的想法，正在接入创作实验室。','先找到要解决的问题，再拆出一个能动手的小步骤。','独家蓝图已点亮！原子老师期待和你聊聊这个点子。'],art:svgScene(stick(115,210,'operator')+'<g class="blueprint"><path d="M260 40H550V215H260Z"/><path d="M290 90H365V145H290ZM430 130H520V185H430ZM365 115H470V130"/><circle cx="470" cy="85" r="22"/></g>'),extra:`<p class="comic-wish">${esc(wish)}</p>`}
    ];return variants[choice];
  }
  const variants=[
    {title:'未来之约 · 传送门启动',type:'portal',captions:['你的期待，化作一束启动能量。','四枚印记汇聚，下一段冒险的门正在打开！','约定收到！带着你的创作愿望，我们一起走向下一站。'],art:svgScene('<path class="ground" d="M30 220H610"/><g class="portal-ring"><ellipse cx="465" cy="125" rx="65" ry="95"/><ellipse cx="465" cy="125" rx="50" ry="80"/></g><g class="portal-walker">'+stick(130,215,'runner')+'</g>')},
    {title:'未来之约 · 展开探索地图',type:'map',captions:['先看清路线，再决定出发，很棒！','探索地图展开：聊聊新本领、看看作品方向，再一起制定计划。','把最想了解的问题带给老师，我们一起看清下一步。'],art:svgScene('<g class="map-sheet"><path d="m190 50 90 20 90-20 90 20V215l-90-20-90 20-90-20Z"/><path d="M280 70V215M370 50V195"/><path class="map-route" d="M220 165 300 115 390 145 435 95" stroke-dasharray="8 8"/><circle cx="220" cy="165" r="10"/><circle cx="435" cy="95" r="10"/></g><text x="215" y="244">了解本领 · 讨论作品 · 一起规划</text>')},
    {title:'未来之约 · 家庭圆桌',type:'family',captions:['重要的决定，可以和家人一起商量。','带上比赛收获与创作愿望，开启一次温暖的家庭讨论。','老师愿意解答你们的问题。今天的通关，已经值得庆祝！'],art:svgScene('<g class="family-members">'+stick(170,215,'family-parent',1.1)+stick(325,215,'family-child',.8)+stick(490,215,'family-parent',1.1)+'</g><g class="speech-bubbles"><path d="M115 30H225V78H185L170 92V78H115Z"/><path d="M280 62H370V100H330L318 112V100H280Z"/><path d="M435 30H545V78H505L490 92V78H435Z"/><text x="138" y="61">收获</text><text x="303" y="90">愿望</text><text x="459" y="61">计划</text></g>')}
  ];return variants[choice];
}
/* Highlight videos: only the choices every student actually makes (first prize / top 10%)
   get a real generated short clip. Every other option falls through to the motion comic. */
function highlightVideo(round, choice) {
  if (gender === 'girl') return null;
  if (round === 0 && choice === 0) return {
    src: 'assets/videos/award-first-prize.mp4',
    title: '探月杯 · 荣耀冲线',
    lines: ['5500 人同台竞技', '只有 100 人拿到一等奖', '你，是那前 1.8% 的强者']
  };
  if (round === 1 && choice === 0) return {
    src: 'assets/videos/rank-top10.mp4',
    title: '选拔赛 · 赛场足迹',
    lines: ['全年级 5500 人', '你，站在前 10%', '550 人里的佼佼者']
  };
  return null;
}
function playHighlightVideo(v, onComplete) {
  stopComic(); const generation = comicGeneration;
  stage.classList.add('is-cinematic');
  const overlay = document.createElement('div');
  overlay.className = 'highlight-overlay';
  overlay.innerHTML = `<div class="highlight-frame"><video src="${v.src}" muted playsinline preload="auto"></video><div class="highlight-top"><span>原子剧场 / 高光时刻</span><strong>${v.title}</strong></div><div class="highlight-lines">${v.lines.map((l,i)=>`<p class="hl-line hl-${i}">${l}</p>`).join('')}</div><button type="button" class="highlight-skip">继续剧情 →</button></div>`;
  stage.appendChild(overlay);
  const video = overlay.querySelector('video');
  let done = false;
  const finish = () => {
    if (done || generation !== comicGeneration) return;
    done = true; clearTimeout(comicTimer);
    overlay.remove(); onComplete();
  };
  overlay.querySelector('.highlight-skip').onclick = finish;
  video.onended = finish;
  video.play().catch(()=>{});
  comicTimer = setTimeout(finish, 8000); /* safety net if the video never fires ended */
}
function playComic(round, choice, onComplete) {
  const hl = highlightVideo(round, choice);
  if (hl) return playHighlightVideo(hl, onComplete);
  stopComic(); const generation=comicGeneration, host=document.querySelector('.question-space');
  const spec=sceneSpec(round,choice,customWish); stage.classList.add('is-cinematic');
  const artwork=paintedScene(spec),painted=Boolean(artwork);
  host.innerHTML=`<section class="comic ${painted?'is-painted':''}" data-type="${spec.type}" data-gender="${gender}" data-answer="${choice}" data-phase="0" aria-label="${spec.title}"><div class="comic-top"><span>原子剧场 / 0${round+1}</span><strong>${spec.title}</strong></div><div class="comic-canvas">${artwork||spec.art}${spec.extra||''}</div><div class="comic-caption" role="status" aria-live="polite"></div><div class="comic-bottom"><span class="comic-note">${spec.note||(round===3?'未来之约 · 你的选择值得被尊重':'创作愿景小剧场')}</span><div><button type="button" class="comic-skip">跳到结果</button><button type="button" class="comic-replay" hidden>重播动画</button></div></div></section>`;
  const scene=host.querySelector('.comic'),caption=host.querySelector('.comic-caption'),skip=host.querySelector('.comic-skip'),replay=host.querySelector('.comic-replay');
  let finished=false;
  const setPhase=n=>{scene.dataset.phase=String(n);caption.textContent=spec.captions[n];};
  const finish=()=>{if(finished||generation!==comicGeneration)return;finished=true;clearTimeout(comicTimer);setPhase(2);skip.hidden=true;replay.hidden=false;onComplete();};
  skip.onclick=finish;replay.onclick=()=>playComic(round,choice,()=>{});
  setPhase(0);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
  else comicTimer=setTimeout(()=>{if(generation!==comicGeneration)return;setPhase(1);comicTimer=setTimeout(finish,painted?3500:3300);},painted?2500:1100);
  host.scrollIntoView({block:'start',behavior:'auto'});
}
