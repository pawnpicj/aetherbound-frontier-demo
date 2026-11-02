import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE || 'sharp');
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const source=path.join(root,'art-source/kael-transparent-source-v2.png');
const target=path.join(root,'public/assets/kael');
await fs.mkdir(target,{recursive:true});
const meta=await sharp(source).metadata();
if(meta.width!==1536||meta.height!==1024||!meta.hasAlpha)throw Error('Expected transparent 1536×1024 six-pose atlas');
const frames=[];
for(let i=0;i<6;i++){
 let cell=sharp(source).extract({left:(i%3)*512,top:Math.floor(i/3)*512,width:512,height:i<3?496:512});
 // The next row's raised sword touches the grid divider; exclude that atlas gutter.
 if(i<3)cell=cell.extend({top:0,bottom:16,left:0,right:0,background:{r:0,g:0,b:0,alpha:0}});
 const tile=await cell.resize(460,460).extend({top:20,bottom:32,left:26,right:26,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 frames.push(tile);
 await sharp(tile).webp({quality:92,alphaQuality:100}).toFile(path.join(target,`pose-${i}-v2.webp`));
}
await sharp({create:{width:1536,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(frames.map((input,i)=>({input,left:(i%3)*512,top:Math.floor(i/3)*512}))).webp({quality:94,alphaQuality:100}).toFile(path.join(target,'kael-atlas-v2.webp'));
await sharp(frames[0]).webp({quality:94,alphaQuality:100}).toFile(path.join(target,'kael-idle-v2.webp'));
await sharp(frames[0]).extract({left:125,top:50,width:300,height:300}).resize(512,512).webp({quality:94,alphaQuality:100}).toFile(path.join(target,'kael-portrait-v2.webp'));
console.log('Prepared 6 poses, atlas and portrait. Alpha preserved.');
