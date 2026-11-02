import {encounters} from './encounter';
export type Element='fire'|'water'|'earth'|'thunder'|'light';
export type Status='playing'|'wave-clear'|'victory'|'defeat';
export interface Hero {id:string;name:string;title:string;element:Element;color:string;hp:number;maxHp:number;bb:number;atk:number;acted:boolean;guarding:boolean;skill:string;role:string}
export interface Enemy {id:string;name:string;shortName:string;variant:'bramble'|'wisp'|'hollowguard';hp:number;maxHp:number;atk:number;boss:boolean}
export interface DamageHit {targetId:string;damage:number;spark:boolean}
export interface HeroHit {i:number;damage:number;sources:string[]}
const roster=[
 {id:'kael',name:'Kael',title:'ASHEN KNIGHT',element:'fire',color:'#f59765',maxHp:1800,atk:340,bb:100,skill:'Crimson Horizon',role:'Damage'},
 {id:'lyra',name:'Lyra',title:'TIDECALLER',element:'water',color:'#6fc4f2',maxHp:1450,atk:300,bb:72,skill:'Celestial Tide',role:'Damage'},
 {id:'orin',name:'Orin',title:'GROVE WARDEN',element:'earth',color:'#8acb9c',maxHp:2100,atk:250,bb:100,skill:'Emerald Aegis',role:'Shield'},
 {id:'ren',name:'Ren',title:'STORM STRIDER',element:'thunder',color:'#c7adfa',maxHp:1500,atk:360,bb:100,skill:'Thousand Skies',role:'Damage'},
 {id:'mira',name:'Mira',title:'DAWNKEEPER',element:'light',color:'#f3d788',maxHp:1600,atk:230,bb:48,skill:'First Light',role:'Heal'},
] satisfies Omit<Hero,'hp'|'acted'|'guarding'>[];
const enemyRoster:Enemy[]=[
  {id:'bramble-1',name:'Bramble Imp I',shortName:'Bramble I',variant:'bramble',maxHp:1500,hp:1500,atk:90,boss:false},
  {id:'wisp-1',name:'Rift Wisp I',shortName:'Wisp I',variant:'wisp',maxHp:1150,hp:1150,atk:75,boss:false},
  {id:'bramble-2',name:'Bramble Imp II',shortName:'Bramble II',variant:'bramble',maxHp:1500,hp:1500,atk:90,boss:false},
  {id:'wisp-2',name:'Rift Wisp II',shortName:'Wisp II',variant:'wisp',maxHp:1150,hp:1150,atk:75,boss:false},
  {id:'bramble-3',name:'Bramble Imp III',shortName:'Bramble III',variant:'bramble',maxHp:1500,hp:1500,atk:90,boss:false},
  {id:'boss',name:'Ancient Hollowguard',shortName:'Hollowguard',variant:'hollowguard',maxHp:15000,hp:15000,atk:360,boss:true},
 ];
const createEnemies=(index:number)=>encounters[index].formation.map(slot=>({...enemyRoster.find(e=>e.id===slot.id)!}));
export class Battle {
 heroes:Hero[]=roster.map(h=>({...h,hp:h.maxHp,acted:false,guarding:false}));
 waveIndex=0;roundTurn=1;
 enemies:Enemy[]=createEnemies(0);
 turn=1;sparks=0;damage=0;status:Status='playing';shield=false;guard=false;selectedTarget=this.enemies[0].id;
 private lastHits=new Map<string,{time:number;unit:string}>();
 get wave(){return encounters[this.waveIndex]}
 get boss(){return this.enemies.find(e=>e.boss)}
 get bossMax(){return this.boss?.maxHp??0}
 get bossHp(){return this.boss?.hp??0}
 set bossHp(value:number){if(this.boss)this.boss.hp=Math.max(0,Math.min(this.boss.maxHp,value))}
 get minions(){return this.enemies.filter(e=>!e.boss)}
 get livingEnemies(){return this.enemies.filter(e=>e.hp>0)}
 get target(){return this.enemies.find(e=>e.id===this.selectedTarget&&e.hp>0)??this.livingEnemies[0]}
 advanceWave(){
  if(this.status!=='wave-clear'||this.waveIndex>=encounters.length-1)return false;
  this.waveIndex++;this.enemies=createEnemies(this.waveIndex);this.selectedTarget=this.enemies[0].id;
  this.status='playing';this.roundTurn=1;this.turn++;this.shield=false;this.guard=false;this.lastHits.clear();
  for(const hero of this.heroes){hero.acted=false;hero.guarding=false;if(hero.hp>0){hero.hp=Math.min(hero.maxHp,hero.hp+Math.round(hero.maxHp*.35));hero.bb=Math.min(100,hero.bb+20)}}
  return true;
 }
 selectTarget(id:string){if(this.status!=='playing'||!this.enemies.some(e=>e.id===id&&e.hp>0))return false;this.selectedTarget=id;return true}
 canAct(i:number,burst=false){const h=this.heroes[i];return this.status==='playing'&&!!h&&h.hp>0&&!h.acted&&(!burst||h.bb>=100)}
 guardHero(i:number){
  if(!this.canAct(i))return false;
  this.heroes[i].acted=true;this.heroes[i].guarding=true;return true;
 }
 act(i:number,burst=false){
  if(!this.canAct(i,burst)||!this.target)return null;
  const h=this.heroes[i];h.acted=true;h.bb=burst?0:Math.min(100,h.bb+32);
  if(burst&&h.role==='Heal')this.heroes.forEach(x=>{if(x.hp>0)x.hp=Math.min(x.maxHp,x.hp+650)});
  if(burst&&h.role==='Shield')this.shield=true;
  return {hero:h,burst,power:h.atk*(burst?3.5:1),hits:burst?6:3,targetId:this.target.id,aoe:burst&&h.role==='Damage'};
 }
 hit(i:number,power:number,time:number,targetId=this.selectedTarget,aoe=false){
  const hits:DamageHit[]=[];
  if(this.status!=='playing')return {damage:0,spark:false,hits};
  const target=this.enemies.find(e=>e.id===targetId&&e.hp>0)??this.target;
  if(!target)return {damage:0,spark:false,hits};
  const previous=this.lastHits.get(target.id),unit=this.heroes[i].id;
  const spark=!!previous&&time-previous.time<=140&&previous.unit!==unit;
  this.lastHits.set(target.id,{time,unit});
  const raw=Math.round(power*(spark?1.5:1));
  const apply=(enemy:Enemy,amount:number,isSpark:boolean)=>{const damage=Math.min(enemy.hp,amount);enemy.hp-=damage;this.damage+=damage;hits.push({targetId:enemy.id,damage,spark:isSpark})};
  apply(target,raw,spark);
  if(aoe)for(const other of this.livingEnemies)if(other.id!==target.id)apply(other,Math.max(1,Math.round(raw*.15)),false);
  if(spark)this.sparks++;
  if(this.livingEnemies.length===0)this.status=this.waveIndex===encounters.length-1?'victory':'wave-clear';
  else if(!this.enemies.some(e=>e.id===this.selectedTarget&&e.hp>0))this.selectedTarget=this.livingEnemies[0].id;
  return {damage:hits.reduce((sum,h)=>sum+h.damage,0),spark,hits};
 }
 get allActed(){return this.heroes.every(h=>h.hp<=0||h.acted)}
 enemyTurn(){
  const hits:HeroHit[]=[];const attackerIds:string[]=[];const heavy=this.bossHp>0&&this.roundTurn%3===0;
  if(this.status!=='playing')return {hits,attackerIds,heavy};
  const byHero=new Map<number,HeroHit>();
  const hurt=(i:number,amount:number,source:string)=>{
   const hero=this.heroes[i],damage=Math.min(hero.hp,Math.round(amount*(this.shield?.5:1)*(this.guard||hero.guarding?.35:1)));
   hero.hp-=damage;hero.bb=Math.min(100,hero.bb+12);
   const entry=byHero.get(i)??{i,damage:0,sources:[]};entry.damage+=damage;entry.sources.push(source);byHero.set(i,entry);
  };
  const livingHeroes=()=>this.heroes.map((h,i)=>({h,i})).filter(x=>x.h.hp>0);
  if(this.boss&&this.boss.hp>0&&livingHeroes().length){
   attackerIds.push(this.boss.id);const alive=livingHeroes();
   const targets=heavy?alive:[alive[(this.roundTurn-1)%alive.length],alive[this.roundTurn%alive.length]].filter((x,i,a)=>a.findIndex(y=>y.i===x.i)===i);
   for(const {i} of targets)hurt(i,heavy?520:this.boss.atk,this.boss.id);
  }
  for(const [index,enemy] of this.minions.entries()){
   const alive=livingHeroes();if(enemy.hp<=0||!alive.length)continue;
   attackerIds.push(enemy.id);hurt(alive[(this.turn+index)%alive.length].i,enemy.atk,enemy.id);
  }
  if(!livingHeroes().length)this.status='defeat';
  else{this.turn++;this.roundTurn++;this.heroes.forEach(h=>h.acted=false)}
  this.heroes.forEach(h=>h.guarding=false);this.guard=false;this.shield=false;this.lastHits.clear();hits.push(...byHero.values());
  return {hits,attackerIds,heavy};
 }
}
