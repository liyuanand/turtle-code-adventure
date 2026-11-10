/* Illustrated scenes are enabled only when all required, generated assets exist. */
function paintedScene(spec) {
  if (["portal", "map", "family"].includes(spec.type)) return futureScene(spec);
  const frames = window.MANGA_FRAMES_BY_GENDER?.[gender]?.[spec.type];
  if (gender === "girl" && !frames) return pendingGirlScene(spec);
  if (!frames || frames.length !== 3) return null;
  const labels = {
    race: ['探月杯 · 荣光时刻', spec.result, '每一份努力，都值得被看见'],
    rank: ['选拔赛 · 赛场足迹', spec.result?.replace('年级', ''), '每一步，都是新的成长'],
    game: ['创造蓝图 · 我的游戏', '我的游戏', '把脑海里的世界，写成作品'],
    software: ['创造蓝图 · 实用软件', '实用软件', '用程序解决生活里的小麻烦'],
    ai: ['创造蓝图 · AI 搭档', 'AI 搭档', '敢于提问，也学会独立判断'],
    blueprint: ['创造蓝图 · 独家点子', '独家蓝图', '你的想法，值得认真探索'],
    portal: ['未来之约 · 准备启程', '下一站', '带上好奇心，一起继续探索'],
    map: ['未来之约 · 先看路线', '探索地图', '了解清楚，再决定下一步'],
    family: ['未来之约 · 家庭圆桌', '一起商量', '把收获与愿望，带给家人'],
    rest: ['成长，不止于成绩', '继续前行', '每个人，都有自己的探索节奏']
  };
  const descriptions = {
    race: ['赛博朋克月球竞技场全景', '编程少年冲向发光终点门', '赛场中的荣耀时刻'],
    rank: ['编程少年仰望通向数据塔的发光星阶', '编程少年踏上新的星阶', '少年抵达俯瞰未来城市的高台'],
    game: ['未来编程创作实验室', '少年在实验室里构想自己的游戏世界', '属于你的游戏创作蓝图'],
    software: ['未来编程创作实验室', '程序将任务整理成有序的流程', '实用软件的创作愿景'],
    ai: ['未来编程创作实验室', '少年与 AI 助手一起思考', '人与 AI 协作的创作愿景'],
    blueprint: ['未来编程创作实验室', '少年面前展开自己的项目蓝图', '独家创作愿景'],
    portal: ['未来代码圣殿中的探索之路', '少年面前的未来之门亮起', '准备走向下一段冒险'],
    map: ['未来代码圣殿中的探索之路', '桌上展开全息探索地图', '思考下一步探索方向'],
    family: ['未来代码圣殿中的探索之路', '孩子与家人在圆桌旁温暖交流', '一家人讨论自己的创作愿望'],
    rest: ['少年仰望新的探索之路', '少年一步步踏上新的台阶', '未来城市中的成长旅程']
  };
  const [heading, result, detail] = labels[spec.type];
  const initial = spec.type === 'race'
    ? '<div class="manga-scale"><strong>5000<span>+</span></strong><span>同场追梦 / 你也在其中</span></div>'
    : `<div class="manga-kicker"><span>原子剧场</span><strong>${esc(spec.title)}</strong></div>`;
  return `<div class="manga-panel" data-kind="${spec.type}" aria-label="${esc(spec.title)}动态分镜">${frames.map((src,i)=>`<img class="manga-shot shot-${i}" src="${src}" alt="${gender === "girl" ? "女生主角：" : "男生主角："}${descriptions[spec.type][i]}" decoding="async">`).join('')}<div class="manga-vignette"></div>${initial}<div class="manga-speed" aria-hidden="true"></div><div class="manga-celebration">${Array.from({length:16},(_,i)=>`<i style="--i:${i}" aria-hidden="true"></i>`).join('')}</div><div class="manga-award"><span>${esc(heading)}</span><strong>${esc(result)}</strong><p>${esc(detail)}</p></div></div>`;
}

/* Finale uses existing AI backgrounds with dedicated animated holograms. */
function futureScene(spec) {
  const variants = {
    portal: {background:'race-keyframe-01', label:'下一阶段 · 准备启程', result:'一起出发', detail:'带上你的创作愿望，开启新的 Python 冒险。', effect:'<div class="promise-portal"><i></i><i></i><i></i><span>PYTHON<br>NEXT CHAPTER</span></div>'},
    map: {background:'lab-keyframe-01', label:'下一阶段 · 先看路线', result:'先看地图', detail:'先聊想学的本领与作品方向，再决定下一步。', effect:'<div class="promise-map"><svg viewBox="0 0 600 300" aria-hidden="true"><path d="M70 225 220 95 390 195 530 65"/><circle cx="70" cy="225" r="13"/><circle cx="220" cy="95" r="13"/><circle cx="390" cy="195" r="13"/><circle cx="530" cy="65" r="13"/></svg><span>01 · 新本领</span><span>02 · 作品方向</span><span>03 · 一起规划</span></div>'},
    family: {background:'rank-keyframe-03', label:'下一阶段 · 家庭圆桌', result:'一起商量', detail:'把今天的收获与愿望带回家，老师等你们的问题。', effect:'<div class="promise-family"><div class="family-orbit"></div><div class="family-thought"><b>我的收获</b><span>比赛与成长</span></div><div class="family-thought"><b>我的愿望</b><span>想做的作品</span></div><div class="family-thought"><b>一起商量</b><span>家人的想法</span></div></div>'}
  };
  const v=variants[spec.type];
  const background = gender === 'girl' && spec.type === 'map' ? 'blueprint-keyframe-01' : gender === 'girl' && spec.type === 'family'
    && !window.MANGA_ASSETS?.['rank-keyframe-03-girl-clean.webp'] ? 'rank-keyframe-01' : v.background;
  const name = background + (gender === "girl" ? "-girl" : "") + "-clean.webp";
  if (gender === "girl" && !window.MANGA_ASSETS?.[name]) return pendingGirlScene(spec);
  return `<div class="manga-panel promise-panel" data-kind="${spec.type}"><img class="promise-backdrop" src="assets/manga/${name}" alt="未来之约的赛博朋克场景"><div class="manga-vignette"></div><div class="promise-heading"><span>最终章 / 你的选择已收到</span><strong>${esc(v.label)}</strong></div><div class="promise-effect">${v.effect}</div><img class="manga-mentor" src="assets/atom-guardian.webp" alt="原子老师在最后一关出场回应你的选择"><div class="manga-award"><span>${esc(v.label)}</span><strong>${v.result}</strong><p>${esc(v.detail)}</p></div></div>`;
}

function pendingGirlScene(spec) {
  const final = ['portal', 'map', 'family'].includes(spec.type);
  return `<div class="manga-panel pending-girl" data-kind="${spec.type}" data-gender="girl"><div class="pending-grid"></div><div class="pending-copy"><span>女生主角 / ${esc(spec.title)}</span><strong>女生版画面待补齐</strong><p>生图服务暂不可用，这一幕暂不播放人物分镜。</p><p>你的选择仍会如实记入纪念卡。</p></div>${final ? '<img class="manga-mentor" src="assets/atom-guardian.webp" alt="原子老师回应你的选择">' : ''}</div>`;
}
