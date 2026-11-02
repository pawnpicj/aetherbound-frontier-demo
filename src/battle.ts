export type Element='fire'|'water'|'earth'|'thunder'|'light';
export type Status='playing'|'victory'|'defeat';
export interface Hero {id:string;name:string;title:string;element:Element;color:string;hp:number;maxHp:number;bb:number;atk:number;acted:boolean;skill:string;role:string}
const roster=[
 {id:'kael',name:'Kael',title:'ASHEN KNIGHT',element:'fire',color:'#f59765',maxHp:1800,atk:340,bb:100,skill:'Crimson Horizon',role:'Damage'},
 {id:'lyra',name:'Lyra',title:'TIDECALLER',element:'water',color:'#6fc4f2',maxHp:1450,atk:300,bb:72,skill:'Celestial Tide',role:'Damage'},
 {id:'orin',name:'Orin',title:'GROVE WARDEN',element:'earth',color:'#8acb9c',maxHp:2100,atk:250,bb:100,skill:'Emerald Aegis',role:'Shield'},
 {id:'ren',name:'Ren',title:'STORM STRIDER',element:'thunder',color:'#c7adfa',maxHp:1500,atk:360,bb:100,skill:'Thousand Skies',role:'Damage'},
 {id:'mira',name:'Mira',title:'DAWNKEEPER',element:'light',color:'#f3d788',maxHp:1600,atk:230,bb:48,skill:'First Light',role:'Heal'},
] satisfies Omit<Hero,'hp'|'acted'>[];
export class Battle {
 heroes:Hero[]=roster.map(h=>({...h,hp:h.maxHp,acted:false}));
 bossMax=18000;bossHp=18000;turn=1;sparks=0;damage=0;status:Status='playing';shield=false;guard=false;
 lastHit=-Infinity;lastUnit='';
 canAct(i:number,burst=false){const h=this.heroes[i];return this.status==='playing'&&!!h&&h.hp>0&&!h.acted&&(!burst||h.bb>=100)}
 act(i:number,burst=false){if(!this.canAct(i,burst))return null;const h=this.heroes[i];h.acted=true;if(burst)h.bb=0;else h.bb=Math.min(100,h.bb+32);if(burst&&h.role==='Heal')this.heroes.forEach(x=>{if(x.hp>0)x.hp=Math.min(x.maxHp,x.hp+650)});if(burst&&h.role==='Shield')this.shield=true;return {hero:h,burst,power:h.atk*(burst?3.5:1),hits:burst?6:3}}
 hit(i:number,power:number,time:number){if(this.status!=='playing')return {damage:0,spark:false};const spark=time-this.lastHit<=140&&this.lastUnit!==this.heroes[i].id;const damage=Math.round(power*(spark?1.5:1));this.lastHit=time;this.lastUnit=this.heroes[i].id;this.bossHp=Math.max(0,this.bossHp-damage);this.damage+=damage;if(spark)this.sparks++;if(!this.bossHp)this.status='victory';return {damage,spark}}
 get allActed(){return this.heroes.every(h=>h.hp<=0||h.acted)}
 enemyTurn(){if(this.status!=='playing')return [];const alive=this.heroes.map((h,i)=>({h,i})).filter(x=>x.h.hp>0);const heavy=this.turn%3===0;const targets=heavy?alive:[alive[(this.turn-1)%alive.length],alive[this.turn%alive.length]].filter((x,i,a)=>a.findIndex(y=>y.i===x.i)===i);const hits=targets.map(({h,i})=>{const damage=Math.round((heavy?610:410)*(this.shield?.5:1)*(this.guard?.35:1));h.hp=Math.max(0,h.hp-damage);h.bb=Math.min(100,h.bb+18);return {i,damage}});if(this.heroes.every(h=>h.hp<=0))this.status='defeat';else{this.turn++;this.heroes.forEach(h=>h.acted=false)}this.guard=false;this.shield=false;this.lastHit=-Infinity;return hits}
}
