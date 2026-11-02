import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {extractPoseComponents} from './extract-pose.mjs';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE || 'sharp');
const root=path.resolve(import.meta.dirname,'..');
const sourceDir=path.join(root,'art-source/party');
const ids=['lyra','orin','ren','mira','hollowguard'];
const summary=[];
for(const id of ids){
 const source=path.join(sourceDir,`${id}-v3.png`),target=path.join(root,'public/assets/characters',id);
 await fs.mkdir(target,{recursive:true});
 const meta=await sharp(source).metadata();
 if(meta.width!==1536||meta.height!==1024||!meta.hasAlpha)throw Error(`${id}: expected RGBA 1536x1024 pose atlas`);
 const stats=await sharp(source).stats();
 if(stats.channels[3].min!==0)throw Error(`${id}: source lacks transparent pixels`);
 const frames=[];
 for(let i=0;i<6;i++){
  // Preserve the generated poses, adding a common transparent packing gutter.
  const raw=await sharp(source).extract({left:(i%3)*512,top:Math.floor(i/3)*512,width:512,height:512}).ensureAlpha().raw().toBuffer();
  let cell=sharp(extractPoseComponents(raw,512,512),{raw:{width:512,height:512,channels:4}});
  if(i<3)cell=cell.extract({left:0,top:0,width:512,height:496});
  // Exclude the next row's art where a generated pose touches the atlas divider.
  if(i<3)cell=cell.extend({top:0,bottom:16,left:0,right:0,background:{r:0,g:0,b:0,alpha:0}});
  const tile=await cell.resize(460,460).extend({top:20,bottom:32,left:26,right:26,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  frames.push(tile);
  await sharp(tile).webp({quality:91,alphaQuality:100}).toFile(path.join(target,`pose-${i}-v3.webp`));
 }
 await sharp({create:{width:1536,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(frames.map((input,i)=>({input,left:(i%3)*512,top:Math.floor(i/3)*512}))).webp({quality:93,alphaQuality:100}).toFile(path.join(target,'atlas-v3.webp'));
 const crop=id==='orin'?{left:100,top:30,width:330,height:330}:id==='hollowguard'?{left:100,top:20,width:340,height:340}:{left:125,top:35,width:300,height:300};
 await sharp(frames[0]).extract(crop).resize(512,512).webp({quality:93,alphaQuality:100}).toFile(path.join(target,'portrait-v3.webp'));
 summary.push({id,frames:6,sourceSize:`${meta.width}x${meta.height}`,alphaMean:stats.channels[3].mean});
}
await fs.writeFile(path.join(sourceDir,'asset-checks.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
