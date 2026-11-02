import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'sharp');
const root=path.resolve(import.meta.dirname,'..');
const input=path.join(root,'art-source/environments/hollow-sanctuary-v4.png');
const target=path.join(root,'public/assets/environments');
await fs.mkdir(target,{recursive:true});
const metadata=await sharp(input).metadata();
// PC runtime keeps the exact source pixels; retain the older WebP for prior variants.
await fs.copyFile(input,path.join(target,'hollow-sanctuary-pc-v8.png'));
await sharp(input).resize(2400,960,{fit:'cover',position:'centre'}).webp({quality:91}).toFile(path.join(target,'hollow-sanctuary-v4.webp'));
console.log(JSON.stringify({source:{width:metadata.width,height:metadata.height},output:await sharp(path.join(target,'hollow-sanctuary-v4.webp')).metadata()}));
