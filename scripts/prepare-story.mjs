import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'sharp');
await mkdir('public/assets/story',{recursive:true});
for(const name of ['forest','river','shrine']){
 await sharp(`art-source/story/${name}.png`).resize({width:1920,withoutEnlargement:true}).webp({quality:90}).toFile(`public/assets/story/${name}.webp`);
}
