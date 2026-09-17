// Build the 30 list-world paintings and the downloadable turtle.bgpic example.
// No API calls. Sources: output/imagegen/list-worlds; prompts: assets/rpg/list-world-prompts.json.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
(async()=>{
 const root=path.join(__dirname,'..');const prompts=JSON.parse(fs.readFileSync(path.join(root,'assets/rpg/list-world-prompts.json')));
 let count=0;
 for(const key of Object.keys(prompts)){
  const source=path.join(root,`output/imagegen/list-worlds/${key}.png`);
  if(!fs.existsSync(source)&&process.argv.includes('--available'))continue;
  await sharp(source).trim({background:'#ffffff',threshold:10}).resize(1200,538,{fit:'fill'}).webp({quality:88}).toFile(path.join(root,`assets/rpg/forms/${key}.webp`));count++;
 }
 const garden=path.join(root,'output/imagegen/list-worlds/carrot-0.png');
 if(fs.existsSync(garden))await sharp(garden).resize(900,404).gif().toFile(path.join(root,'assets/rpg/garden.gif'));
 console.log(`Built ${count} list-world scenes.`);
})().catch(error=>{console.error(error);process.exit(1)});
