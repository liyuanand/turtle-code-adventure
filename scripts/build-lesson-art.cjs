// Convert the approved SenseNova source paintings; performs no external API calls.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.join(__dirname, '..');
(async () => {
  const prompts = JSON.parse(fs.readFileSync(path.join(root, 'assets/lessons/painted-prompts.json')));
  let count = 0;
  for (const key of Object.keys(prompts)) {
    const source = path.join(root, `output/imagegen/lessons/${key}.png`);
    if (!fs.existsSync(source) && process.argv.includes('--available')) continue;
    const output = path.join(root, `assets/lessons/${key}.webp`);
    if (key === 'turtle-sprite') {
      const meta = await sharp(source).metadata();
      const inset = Math.floor(meta.width * .2);
      const size = Math.floor(meta.width * .6);
      const { data, info } = await sharp(source).extract({left:inset,top:inset,width:size,height:size}).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
      // Remove the generated magenta matte without touching green skin or red scarf.
      for (let i = 0; i < data.length; i += 4) {
        const matte = Math.min(data[i], data[i + 2]) - data[i + 1];
        if (matte > 70) data[i + 3] = 0;
      }
      await sharp(data, {raw:info}).trim().resize(256,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({lossless:true}).toFile(output);
    } else {
      const tile = key.endsWith('-wall');
      await sharp(source).trim({background:'#ffffff',threshold:10}).resize(tile ? 256 : 1200, tile ? 256 : 538, {fit:'fill'}).webp({quality:88}).toFile(output);
    }
    count++;
  }
  console.log(`Built ${count} painted lesson assets.`);
})().catch(error => { console.error(error); process.exit(1); });
