import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {extractPoseComponents} from './extract-pose.mjs';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'sharp');
for(const id of ['bramble','wisp']){
 const source=`art-source/monsters/${id}-v6.png`,target=`public/assets/monsters/${id}`;
 await fs.mkdir(target,{recursive:true});
 const meta=await sharp(source).metadata(),stats=await sharp(source).stats();
 if(meta.width!==1536||meta.height!==1024||!meta.hasAlpha||stats.channels[3].min!==0)throw Error(`${id}: invalid transparent 3x2 atlas`);
 const frames=[];
 for(let i=0;i<6;i++){
  const raw=await sharp(source).extract({left:i%3*512,top:Math.floor(i/3)*512,width:512,height:512}).ensureAlpha().raw().toBuffer();
  const tile=await sharp(extractPoseComponents(raw,512,512),{raw:{width:512,height:512,channels:4}}).resize(460,460).extend({top:20,bottom:32,left:26,right:26,background:'#00000000'}).png().toBuffer();
  frames.push(tile);await sharp(tile).webp({quality:91,alphaQuality:100}).toFile(path.join(target,`pose-${i}-v6.webp`));
 }
 await sharp({create:{width:1536,height:1024,channels:4,background:'#00000000'}}).composite(frames.map((input,i)=>({input,left:i%3*512,top:Math.floor(i/3)*512}))).webp({quality:93,alphaQuality:100}).toFile(path.join(target,'atlas-v6.webp'));
 console.log(`${id}: six transparent frames prepared`);
}
