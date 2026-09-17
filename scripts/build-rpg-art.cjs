// Rebuild with Node and sharp: NODE_PATH=/path/to/node_modules node scripts/build-rpg-art.cjs
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.join(__dirname, '..');
const themes = {
  microbit: { base: 11, colors: ['#40c9bc','#58a8ed','#ca83ed'], dark:'#123c49' },
  storm: { base:11, colors:['#6bb9eb','#9b8be9','#ffc963'], dark:'#273c58' },
  mask: { base:12, colors:['#acd5b6','#a38ae6','#ffcc67'], dark:'#302949' },
  slime: { base:13, colors:['#ffa738','#c78aeb','#ff7453'], dark:'#245253' },
  serpent: { base:14, colors:['#70bca7','#669edd','#e5b564'], dark:'#446280' },
  dragon: { base:11, colors:['#9176c8','#9566dd','#e97662'], dark:'#263c59' }
};
const bodies = {
 storm: [
 'M24 42Q5 20 34 20Q43 3 60 22Q91 5 98 32Q112 48 90 57L74 97L48 108L60 79L33 79L49 58L23 58Z',
 'M15 48Q0 25 30 23Q36 3 58 19Q83 1 98 27Q121 31 106 54L88 58L98 77L70 69L63 108L49 77L25 90L34 63Z',
 'M60 3L76 24L107 17L100 45L119 66L91 78L88 109L60 95L32 109L29 78L1 66L20 45L13 17L44 24Z'],
 mask:[
 'M29 22L91 22L85 78L60 103L35 78Z',
 'M12 30L50 16L60 30L70 16L108 30L99 78L77 101L60 90L43 101L21 78Z',
 'M24 38L17 5L43 23L60 1L77 23L103 5L96 38L88 84L60 111L32 84Z'],
 slime:[
 'M16 99Q7 79 27 61Q27 25 59 29Q91 21 96 64Q118 104 88 105Z',
 'M7 102L22 76L4 59L30 53L21 24L46 34L59 5L75 33L107 19L97 54L118 64L100 84L113 106Z',
 'M7 107Q0 66 27 51L21 13L45 31L61 1L77 31L107 12L98 54Q124 78 112 109Z'],
 serpent:[
 'M17 107Q-3 75 33 76L75 77Q91 74 82 60L59 55L50 30L69 15L96 25L105 48Q122 104 84 110Z',
 'M9 105Q-7 65 34 65L76 71L54 46L58 21L89 9L112 36L97 65Q130 117 69 111Z',
 'M18 110Q0 78 41 78L76 86L61 51L53 26L80 3L110 31L94 61Q127 120 76 116Z'],
 dragon:[
 'M31 103L24 72L38 46L30 13L54 26L74 14L91 35L87 65L107 91L81 108L59 94Z',
 'M38 108L27 79L40 52L34 16L55 26L75 15L87 35L81 62L96 91L82 109L60 99Z',
 'M26 110L31 73L41 49L29 14L48 21L61 0L73 21L92 13L79 49L86 74L96 110L60 96Z']
};
function body(kind, phase, color, friendly=false) {
 const gradient = 'url(#body)';
 let wings = '';
 if(phase>=1 && ['dragon','serpent','storm'].includes(kind)) wings = `<path d="M43 57L4 ${phase===2?0:20}L-14 34L-20 94L7 77L22 92L37 73ZM78 57L117 ${phase===2?0:20}L136 34L142 94L115 77L99 92L82 73Z" fill="${gradient}"/><path d="M4 25L35 65M-12 52L35 65M118 25L85 65M132 52L85 65" fill="none" stroke="${color}" stroke-width="3"/>`;
 let shape = kind==='microbit' ? `<path d="M25 34L9 47L3 80L22 86L30 64M94 34L113 46L120 79L101 87L92 63" fill="#647ea1"/><rect x="26" y="16" width="68" height="85" rx="10" fill="${gradient}"/><rect x="34" y="34" width="52" height="48" rx="4" fill="#142239"/><path d="M36 103L34 116L49 116L52 103M69 103L70 116L85 116L84 103" fill="#48667f"/>` : `<path d="${bodies[kind][phase]}" fill="${gradient}"/>`;
 if(kind==='microbit'){
  const heart=['01010','11111','11111','01110','00100'],face=['00000','01010','00000','10001','01110'];
  for(let y=0;y<5;y++)for(let x=0;x<5;x++)shape+=`<rect x="${39+x*9}" y="${38+y*8}" width="5" height="5" rx="1" stroke="none" fill="${(friendly?face:heart)[y][x]==='1'?'#ff6878':'#3c405c'}"/>`;
  shape+='<rect x="49" y="23" width="22" height="5" rx="2" fill="#ffc957" stroke="none"/>';
  if(phase===1)shape+='<circle cx="6" cy="65" r="19" fill="#8bb9db"/><circle cx="6" cy="65" r="10" fill="#21344b"/><circle cx="114" cy="65" r="19" fill="#8bb9db"/><circle cx="114" cy="65" r="10" fill="#21344b"/>';
  if(phase===2)shape+='<path d="M27 18L13 3L28 6L37 18M93 18L107 3L94 6L85 18" fill="#ffe798"/><path d="M0 29L-10 57L0 57L-6 80L14 48L4 48Z M120 29L132 57L120 57L126 80L106 48L116 48Z" fill="#fff29d"/>';
 }else {
  if(kind==='mask'&&phase===1)shape+='<path d="M60 30L60 90" fill="none"/><path d="M24 42L41 46M80 46L97 42" fill="none" stroke="#fff0ba"/>';
  if(phase===2 && ['dragon','mask','slime'].includes(kind))shape+='<path d="M37 30L83 30L78 13L68 19L60 7L50 19L41 13Z" fill="#ffe18d"/>';
  if(kind==='serpent')shape+='<path d="M25 87L34 104M45 86L52 108M70 86L80 107M69 33L97 43" fill="none" stroke="#304e68" stroke-width="6"/>';
  if(friendly)shape+='<path d="M38 53Q44 45 51 53M69 53Q76 45 83 53M48 73Q60 88 75 73" fill="none" stroke-width="4"/>';
  else shape+='<path d="M37 48L53 54L48 63L39 60ZM67 54L84 48L81 60L72 63Z" fill="#fff5c7"/><path d="M44 54L46 59M75 54L75 59"/><path d="M48 77Q60 69 77 78L72 86L66 80L58 84L53 79Z" fill="#1c273f"/>';
  shape+='<path d="M35 38L40 31M30 70L32 77" stroke="#ffffff" opacity=".42" stroke-width="3"/>';
 }
 if(phase===1 && !['microbit','serpent'].includes(kind))shape+='<path d="M26 77L42 87L48 109L30 101ZM94 77L78 87L72 109L90 101Z" fill="#7793bb"/>';
 if(phase===2)shape+='<path d="M60 89L68 97L60 108L52 97Z" fill="#a8fff4" stroke="#e6fff8" stroke-width="2"/>';
 return `<g stroke="#142237" stroke-width="3" stroke-linejoin="round">${wings}${shape}</g>`;
}
function scene(kind,t,phase,bg){
 const active=Math.min(phase,2),color=t.colors[active];
 const friendly=phase===4;
 let creature=phase<3||friendly?`<g transform="translate(${friendly?930:915} ${friendly?286:282}) scale(${friendly?1.55:phase===0?2.6:3.0}) translate(-60 -60)">${body(kind,friendly?0:active,friendly?'#80dfbb':color,friendly)}</g>`:'';
 let props='';
 if(phase>=3){
  props+=`<path d="M787 436L918 392L1069 436L949 481Z" fill="#50799a" stroke="#142237" stroke-width="8"/><path d="M840 425L930 380L1010 424L929 460Z" fill="#85c9da" stroke="#263e5a" stroke-width="6"/>`;
  if(phase===3)props+='<path d="M933 173L990 256L933 347L876 256Z" fill="#9ffff0" stroke="#f3fff9" stroke-width="9"/><path d="M933 173L933 347L876 256Z" fill="#4abebb"/><path d="M738 358L781 333L789 371L758 388ZM1070 365L1100 328L1134 365L1100 389ZM825 473L857 455L875 481L841 500Z" fill="#667b9d" stroke="#243953" stroke-width="6"/>';
  if(phase===4)props+='<path d="M1090 176L1124 222L1090 266L1056 222Z" fill="#b4fff1" stroke="#f5fff5" stroke-width="6"/><path d="M1041 204L1002 163M1102 149L1112 115M1150 204L1173 186" stroke="#b4fff1" stroke-width="7"/>';
  if(phase===5)props+='<path d="M823 383L823 296Q922 132 1020 296L1020 383Z" fill="#66e2c2" stroke="#d3fff0" stroke-width="15"/><path d="M858 369L858 305Q922 211 985 305L985 369Z" fill="#d7fff3"/><path d="M857 381L1001 381L1020 454L839 454Z" fill="#e1a345" stroke="#443d42" stroke-width="8"/><path d="M839 384Q837 331 915 331Q994 325 1001 384Z" fill="#ffe094" stroke="#443d42" stroke-width="8"/><rect x="902" y="374" width="28" height="44" rx="5" fill="#fff5b6" stroke="#443d42" stroke-width="6"/>';
 }
 const sparks=Array.from({length:phase>=3?13:7},(_,i)=>{const x=725+(i*79)%440,y=70+(i*67)%400;return `<path d="M${x} ${y-8}L${x+3} ${y-3}L${x+8} ${y}L${x+3} ${y+3}L${x} ${y+8}L${x-3} ${y+3}L${x-8} ${y}L${x-3} ${y-3}Z" fill="${phase>=3?'#c6fff0':'#d1e3f9'}" opacity=".65"/>`}).join('');
 let device='';
 if(kind==='microbit')device=`<g transform="translate(465 77)"><rect width="182" height="156" rx="18" fill="#253a55" stroke="#adcbdc" stroke-width="6"/><rect x="62" y="9" width="57" height="15" rx="5" fill="#ffd467"/>${Array.from({length:25},(_,i)=>`<rect x="${47+i%5*20}" y="${35+Math.floor(i/5)*20}" width="12" height="12" rx="2" fill="${(phase?'0101011111111110111000100':'0000000000000000000000000')[i]==='1'?'#ff627c':'#56617c'}"/>`).join('')}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="538" viewBox="0 0 1200 538"><defs><linearGradient id="cover"><stop stop-color="${t.dark}" stop-opacity="0"/><stop offset=".07" stop-color="${t.dark}"/></linearGradient><linearGradient id="body" x2=".8" y2="1"><stop stop-color="${friendly?'#a9efd0':color}"/><stop offset="1" stop-color="${friendly?'#3c9e98':t.dark}"/></linearGradient></defs><image href="data:image/jpeg;base64,${bg}" width="1200" height="538"/><rect x="570" width="630" height="538" fill="url(#cover)"/><path d="M697 423L870 410L1200 434L1200 538L690 538Z" fill="#16283d" opacity=".6"/><path d="M773 498L1040 464L1200 488M792 436L1131 426" stroke="#7a9bb5" opacity=".28" stroke-width="3"/><g fill="none" stroke="#b8d9ef" opacity=".12" stroke-width="4"><path d="M700 400V180L740 140V80M1140 425V170L1100 130V80M660 456H720L746 430H1080L1120 460H1200"/><circle cx="938" cy="282" r="205"/><circle cx="938" cy="282" r="187"/><path d="M820 70H1060M805 88H1075"/></g>${sparks}<ellipse cx="936" cy="461" rx="173" ry="28" fill="#080f22" opacity=".38"/>${device}${props}${creature}</svg>`;
}
(async()=>{
 const out=path.join(root,'assets/rpg/forms');fs.mkdirSync(out,{recursive:true});
 for(const [key,t] of Object.entries(themes)){
  const bg=fs.readFileSync(path.join(root,`assets/rpg/chapter-${t.base}.jpg`)).toString('base64');
  for(let phase=0;phase<6;phase++)await sharp(Buffer.from(scene(key,t,phase,bg))).webp({quality:88}).toFile(path.join(out,`${key}-${phase}.webp`));
 }
 console.log('Built 36 illustrated battle and story frames.');
})();
