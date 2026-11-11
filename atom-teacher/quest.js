const stage = document.getElementById('stage');
const questions = [
  {
    chapter: '第一幕 · 探月荣光', label: '先回顾你的探月时刻', scene: '每一份努力，都有回响',
    question: '这次探月杯比赛，你获得了几等奖？',
    options: ['一等奖', '二等奖', '三等奖'],
    replies: [
      '一等奖，真棒！为你的努力和这次收获击个掌。接下来，我们一起把学到的本领用在新作品里。',
      '二等奖，值得为自己鼓掌！回想一下，这次你最满意的一次尝试是什么？带着这份收获，我们继续探索。',
      '三等奖，同样值得庆祝！站上赛场、完成挑战，就是宝贵的经历。下一次，我们一起把作品打磨得更好。'
    ], badge: '探月印记', optional: true
  },
  {
    chapter: '第二幕 · 赛场足迹', label: '成绩是这一站的记录', scene: '记录成长，继续向前',
    question: '在国际编程奥林匹克竞赛选拔赛中，你的年级排名位于前多少？',
    hint: '按实际成绩选择；如果多个选项都符合，选择最靠前的一项。',
    options: ['年级前 10%', '年级前 20%', '年级前 30%', '年级前 50%'],
    replies: [
      '年级前 10%，为这次成绩点赞！接下来，试着把解题时的思路讲清楚，再挑战新的问题。',
      '年级前 20%，这份收获值得开心！我们可以一起看看哪些题最有挑战，找到下一步练习的方向。',
      '年级前 30%，给自己的努力一个肯定！把还没想通的题拆成小步骤，老师陪你慢慢攻克。',
      '年级前 50%，谢谢你认真记录这次成绩！排名只是这一站的坐标，我们一起找出一个能进步的小目标。'
    ], badge: '赛场印记', optional: true
  },
  {
    chapter: '第三幕 · 创造蓝图', label: '让编程连接你的生活', scene: '你的想法，值得实现',
    question: '如果继续学习编程，你最期待做出什么，或掌握什么新本领？',
    options: ['做一个属于我的游戏', '做一个帮我处理麻烦事儿的软件', '学习 AI，并学会使用它', '其他，我想自己填写'],
    replies: [
      '属于你的游戏，听起来就很酷！我们可以从角色、规则和得分开始，把脑海里的冒险一步步做出来。',
      '这个想法很实用！从生活里挑一件重复又麻烦的小事，我们试着把它拆成程序能完成的步骤。',
      'AI 很值得探索！我们一起学习怎么用代码和它配合，也练习判断它的回答是否可靠。',
      '你的创作蓝图收到啦！我们可以先聊聊它要解决什么问题，再把大想法拆成能动手的小步骤。'
    ], badge: '创造印记', otherIndex: 3
  },
  {
    chapter: '第四幕 · 未来之约', label: '下一段故事，由你选择', scene: '下一段冒险，等你开启',
    question: '你期待继续跟着原子老师，深入学习更厉害的编程本领吗？',
    options: ['我愿意！一起开启下一阶段冒险', '我想先看看下一阶段会学什么', '我想和爸爸妈妈商量一下'],
    replies: [
      '太好啦，收到你的期待！把你最想实现的目标告诉老师，我们一起看看下一阶段怎样继续向它靠近。',
      '当然！先看看会学哪些本领、能做哪些作品，再决定下一步。你也可以把最想了解的问题告诉老师。',
      '好呀！把今天的收获和你的作品愿望带给爸爸妈妈，一起聊聊下一步。老师也愿意帮你们解答课程问题。'
    ], badge: '未来印记'
  }
];
let current = -1, nickname = '小小编程家', gender = 'boy', adventureDate = '', answers = [], locked = false, customWish = '';
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function progress(n) { document.querySelector('.steps').innerHTML = Array.from({length:questions.length + 2}, (_, i) => `<span class="dot ${i <= n ? 'on' : ''}"></span>`).join(''); }
function art() { return '<div class="halo" aria-hidden="true"></div><div class="code-rain" aria-hidden="true">while curiosity:<br>　learn()<br>　try_again()<br>　create_your_world()</div><img class="portrait" src="assets/atom-guardian.webp" alt="源码蛋守护者：原子老师">'; }
function badges(n) { return questions.map((q,i) => `<span class="badge ${i<n?'earned':''}">${i<n?'✦':'◇'} ${q.badge}</span>`).join(''); }
function intro() {
  stopComic(); stage.classList.remove('is-cinematic');
  stage.dataset.scene = 'intro'; current = -1; answers = []; customWish = ''; gender = 'boy'; locked = false; progress(0);
  stage.innerHTML = art() + `<div class="chapter">序幕 / 最后一位守关者，竟然是……</div><div class="intro-title flash"><span class="seal">隐藏 BOSS · 原子老师</span><h1>源码之约</h1><p>代码之门缓缓打开。<br>熟悉的声音，从光里传来。</p></div><div class="dialog flash"><div class="speaker">原子老师 / 源码蛋守护者</div><h2>“终于等到你了，小小编程家。”</h2><p>一起回顾赛场收获，聊聊你的创作愿望。点亮四枚成长印记，我们就能打开源码蛋结界！</p><div class="name-row"><label for="nickname">你的冒险昵称</label><input id="nickname" maxlength="12" placeholder="小小编程家" autocomplete="off"></div><fieldset class="gender-picker"><legend>选择冒险主角</legend><label><input type="radio" name="gender" value="boy" checked><span>男生</span></label><label><input type="radio" name="gender" value="girl"><span>女生</span></label></fieldset><button class="primary" id="start">接受原子老师的挑战 →</button></div>`;
  document.getElementById('start').onclick = () => { nickname = document.getElementById('nickname').value.trim() || '小小编程家'; gender = stage.querySelector('input[name=gender]:checked').value; adventureDate = new Date().toLocaleDateString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit'}); showQuestion(0); };
}
function showQuestion(n) {
  stopComic(); stage.classList.remove('is-cinematic');
  stage.dataset.scene = 'question'; stage.dataset.round = String(n); current = n; locked = false; progress(n+1); const q = questions[n];
  stage.innerHTML = art() + `<div class="chapter">${q.chapter} / 0${n+1}</div><div class="battle-head"><div><div class="boss-name">原子老师 · 源码守护结界</div><div class="hp" role="progressbar" aria-label="结界开启进度" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${questions.length}"><span style="width:${n/questions.length*100}%"></span></div></div><div class="badges">${badges(n)}</div></div><div class="question-space"><div class="panel-label flash">${q.scene}</div></div><div class="dialog flash"><div class="speaker">原子老师 / ${q.label}</div><h2>${q.question}</h2>${q.hint?`<p class="question-hint">${q.hint}</p>`:''}<div class="choices">${q.options.map((o,i)=>`<button class="choice" data-choice="${i}" ${i===q.otherIndex?'aria-expanded="false" aria-controls="other-form"':''}>${String.fromCharCode(65+i)}　${o}</button>`).join('')}</div>${q.optional?'<button class="skip" id="skip">未参赛 / 还不知道成绩 / 暂不填写</button>':''}${q.otherIndex!==undefined?'<form id="other-form" class="other-form" hidden><label for="other-wish">写下你想做的作品或想学的本领</label><textarea id="other-wish" rows="3" maxlength="80" placeholder="比如：做一个帮我整理错题的小助手" required></textarea><p class="question-hint">最多 80 字，写下一个简单的想法就可以。</p><p id="other-error" class="field-error" role="alert"></p><button class="secondary" type="submit">确认我的想法</button></form>':''}<p class="feedback" id="feedback" role="status"></p><button id="next" class="primary" hidden>${n===questions.length-1?'打开源码蛋结界 ✦':'点亮印记，继续剧情 →'}</button></div>`;
  stage.querySelectorAll('[data-choice]').forEach(b => b.onclick = () => select(Number(b.dataset.choice)));
  if (q.optional) document.getElementById('skip').onclick = () => commit(null, '没关系，不用为了闯关猜一个成绩。你的成长不止体现在排名里，我们继续聊聊吧。');
  if (q.otherIndex !== undefined) document.getElementById('other-form').onsubmit = e => {
    e.preventDefault(); const input = document.getElementById('other-wish'); const value = input.value.trim();
    if (!value) { document.getElementById('other-error').textContent = '先写下你的想法，再确认哦。'; input.focus(); return; }
    customWish = value; commit(q.otherIndex, q.replies[q.otherIndex]);
  };
  document.getElementById('next').onclick = () => n < questions.length-1 ? showQuestion(n+1) : card();
  stage.scrollIntoView({block:'start',behavior:'auto'});
}
function select(i) {
  if (locked) return;
  const q = questions[current]; const form = document.getElementById('other-form');
  if (form) { form.hidden = i !== q.otherIndex; stage.querySelector(`[data-choice="${q.otherIndex}"]`).setAttribute('aria-expanded', String(i === q.otherIndex)); }
  if (i === q.otherIndex) { stage.querySelectorAll('[data-choice]').forEach(b => b.classList.toggle('selected', Number(b.dataset.choice) === i)); document.getElementById('other-wish').focus(); return; }
  commit(i, q.replies[i]);
}
function commit(i, reply) {
  if (locked) return; locked = true; answers[current] = i;
  stage.querySelectorAll('[data-choice]').forEach(b => { b.disabled = true; b.classList.toggle('selected', Number(b.dataset.choice) === i); });
  const skip = document.getElementById('skip'); if (skip) skip.disabled = true;
  const input = document.getElementById('other-wish'); if (input) { input.disabled = true; stage.querySelector('#other-form button').disabled = true; }
  playComic(current, i, () => {
    document.getElementById('feedback').textContent = '原子老师：“' + reply + '”';
    stage.querySelector('.badges').innerHTML = badges(current+1);
    stage.querySelector('.hp span').style.width = (current+1)/questions.length*100 + '%';
    stage.querySelector('.hp').setAttribute('aria-valuenow', current+1);
    document.getElementById('next').hidden = false;
  });
}
function answerText(n) { if (answers[n] === null) return '暂未填写'; if (n === 2 && answers[n] === questions[n].otherIndex) return customWish; return questions[n].options[answers[n]]; }
function ending() {
  stopComic(); stage.classList.remove('is-cinematic');
  stage.dataset.scene = 'reward'; progress(questions.length+1);
  stage.innerHTML = `<div class="reward flash"><div class="eyebrow">结界开启 / 终章反转</div><h1>${esc(nickname)}，通关啦！</h1><div class="badges">${badges(questions.length)}</div><img class="egg" src="assets/source-egg-cutout.webp" alt="通关奖励：彩虹渐变鳞片造型源码蛋实物照片"><div class="speaker">原子老师</div><blockquote>“赛场记录了你的一次挑战，<br>而你的好奇心，还能带你去更远的地方。<br>这颗源码蛋，送给愿意探索、敢于表达的你。”</blockquote><p>通关奖励：一颗真正的源码蛋</p><div class="actions"><button class="primary" id="card">查看我的通关纪念卡 →</button><button class="secondary" id="replay">重看老师的登场</button><a class="secondary adventure-continue" href="../?resume=19">继续第19关 →</a></div><div class="notice">你愿意的话，可以截图发给原子老师，联系老师领取。<br>具体领取方式请联系原子老师。</div></div>`;
  document.getElementById('card').onclick = card; document.getElementById('replay').onclick = intro; stage.scrollIntoView({block:'start',behavior:'auto'});
}
function card() {
  stopComic(); stage.classList.remove('is-cinematic');
  stage.dataset.scene = 'card';
  const identity = {boy:'男生',girl:'女生'}[gender] || '男生';
  stage.innerHTML = `<div class="reward card-page flash"><article class="card keepsake" aria-label="${esc(nickname)}的通关纪念卡"><div class="keepsake-top"><span>PYTHON ADVENTURE</span><span>隐藏终章 · 已通关</span></div><div class="keepsake-title"><span class="keepsake-kicker">原子老师的源码试炼</span><h2>源码之约<span>成长纪念卡</span></h2><div class="completion-seal"><strong>4 / 4</strong><span>印记已集齐</span></div></div><div class="keepsake-hero"><div class="explorer"><span class="explorer-label">本次冒险的主角</span><h3>${esc(nickname)}</h3><span class="explorer-identity">✦ ${identity}</span><p>带着好奇心出发，<br>把想象写成自己的作品。</p></div><div class="egg-showcase"><div class="egg-orbit"></div><img class="egg" src="assets/source-egg-cutout.webp" alt="通关奖励：真正的彩虹源码蛋"><span>源码蛋 · 已解锁</span></div></div><div class="keepsake-badges">${questions.map((q,i)=>`<div><span>0${i+1}</span><b>✦</b><strong>${q.badge}</strong></div>`).join('')}</div><div class="keepsake-records"><div><span>01 / 探月杯比赛</span><strong>${esc(answerText(0))}</strong></div><div><span>02 / 选拔赛年级排名</span><strong>${esc(answerText(1))}</strong></div></div><div class="keepsake-wish"><span>03 / 我的创造蓝图</span><p>${esc(answerText(2))}</p></div><div class="keepsake-future"><span>04 / 关于下一段冒险</span><p>${esc(answerText(3))}</p></div><div class="keepsake-message"><span>原子老师寄语</span><p>“今天的每一次尝试，<br>都是你走向未来的一行代码。”</p><strong>原子老师 <span>/ 陪你探索下一站</span></strong></div><footer class="keepsake-footer"><div><strong>通关奖励 · 一颗真正的源码蛋</strong><p>愿意的话，截图发给原子老师，联系老师领取。</p></div><time>${esc(adventureDate)}</time></footer><div class="screenshot-cta"><div class="screenshot-cta-tag">领取源码蛋</div><strong>截图这张纪念卡，发给原子老师</strong><span>老师看到后，就会把专属源码蛋送给你！</span></div></article><div class="toolbar"><button class="secondary" id="back">返回结局</button><a class="secondary adventure-continue" href="../?resume=19">继续第19关 →</a></div><p class="notice">截图保存这份成长纪念，把你的愿望带给老师。<br>学习意愿可以慢慢商量，今天的成长值得庆祝。</p></div>`;
  document.getElementById('back').onclick = ending; stage.scrollIntoView({block:'start',behavior:'auto'});
}
document.getElementById('restart').onclick = intro;
intro();
