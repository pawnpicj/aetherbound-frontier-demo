import {heroFormation} from './encounter';

export type HeroPosition=typeof heroFormation[number];
export const createFormation=():HeroPosition[]=>heroFormation.map(p=>({...p}));
const storageKey='aetherbound.formation.v1';

function validSlots(value:unknown):value is number[]{
 return Array.isArray(value)&&value.length===heroFormation.length&&new Set(value).size===heroFormation.length&&value.every(i=>Number.isInteger(i)&&i>=0&&i<heroFormation.length);
}

export function loadFormation(storage?:Pick<Storage,'getItem'>):HeroPosition[]{
 try{
  const slots:unknown=JSON.parse((storage??globalThis.localStorage).getItem(storageKey)??'null');
  if(validSlots(slots))return createFormation().map((p,i)=>({...p,x:heroFormation[slots[i]].x,y:heroFormation[slots[i]].y}));
 }catch{/* Missing or unavailable browser storage falls back to the default formation. */}
 return createFormation();
}

export function saveFormation(formation:HeroPosition[],storage?:Pick<Storage,'setItem'>):boolean{
 const slots=formation.map(p=>heroFormation.findIndex(slot=>slot.x===p.x&&slot.y===p.y));
 if(!validSlots(slots))return false;
 try{(storage??globalThis.localStorage).setItem(storageKey,JSON.stringify(slots));return true}catch{return false}
}

export function nearestFormationSlot(x:number,y:number):number|null{
 let nearest:number|null=null,distance=100;
 heroFormation.forEach((p,i)=>{const next=Math.hypot(x-p.x,y-p.y);if(next<distance){nearest=i;distance=next}});
 return nearest;
}

export function swapHeroIntoSlot(formation:HeroPosition[],heroIndex:number,slotIndex:number):HeroPosition[]{
 const target=heroFormation[slotIndex],hero=formation[heroIndex];
 if(!target||!hero)return formation;
 const occupant=formation.findIndex(p=>p.x===target.x&&p.y===target.y);
 if(occupant<0||occupant===heroIndex)return formation;
 return formation.map((p,i)=>i===heroIndex?{...p,x:target.x,y:target.y}:i===occupant?{...p,x:hero.x,y:hero.y}:{...p});
}
