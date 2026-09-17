// Convert original chapter art and approved SenseNova paintings to game assets.
// Prompts: assets/rpg/painted-prompts.json. Generated PNGs stay in output/imagegen/.
// This script performs no API calls. Run with sharp available through NODE_PATH.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.join(__dirname, '..');
const chapters = { microbit:null, storm:11, mask:12, slime:13, serpent:14, dragon:15 };
(async () => {
  for (const [theme, chapter] of Object.entries(chapters)) {
    for (let phase = 0; phase < 6; phase++) {
      const original = phase === 0 && chapter !== null;
      const source = path.join(root, original ? `assets/rpg/chapter-${chapter}.jpg` : `output/imagegen/${theme}-${phase}.png`);
      if (!fs.existsSync(source)) throw Error(`Missing source painting: ${source}`);
      let image = sharp(source);
      if (!original) image = image.trim({ background: '#ffffff', threshold: 10 });
      // Preserve the complete composition, including wings and claws.
      await image.resize(1200, 538, { fit:'fill' }).webp({ quality:88 }).toFile(path.join(root, `assets/rpg/forms/${theme}-${phase}.webp`));
    }
  }
  console.log('Built 36 painted scenes; retained all five original opening paintings.');
})();
