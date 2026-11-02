import {battlefield} from './encounter';

// Phaser 3.90 renders at the configured game size. Keep battle coordinates
// separate from the backing canvas size so CSS never stretches a low-res frame.
export function renderScaleFor(cssWidth:number,devicePixelRatio:number){
 const minimum=cssWidth>=800?2:1;
 const required=cssWidth*Math.max(1,devicePixelRatio)/battlefield.width;
 return Math.min(3,Math.max(minimum,Math.ceil(required*2)/2));
}
