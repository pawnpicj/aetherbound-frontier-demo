import Phaser from 'phaser';

type HeroSprite=Phaser.GameObjects.Image;
const jade=0x79e6b4,gold=0xe1cf89,pale=0xdeffe5;

function leaf(g:Phaser.GameObjects.Graphics,x:number,y:number,size:number,angle:number,color=jade){
 const points=[[0,-size],[size*.48,-size*.2],[size*.3,size*.4],[0,size*.7],[-size*.3,0]].map(([px,py])=>new Phaser.Math.Vector2(x+px*Math.cos(angle)-py*Math.sin(angle),y+px*Math.sin(angle)+py*Math.cos(angle)));
 g.fillStyle(color,.85).fillPoints(points,true);g.lineStyle(.7,pale,.55).lineBetween(x,y+size*.35,x,y-size*.55);
}

function vine(g:Phaser.GameObjects.Graphics,side:number,size:number){
 const points=Array.from({length:25},(_,i)=>{const t=i/24;return new Phaser.Math.Vector2(side*(size*.28+Math.sin(t*Math.PI)*size*.12),-t*size*.79)});
 for(const [width,alpha] of [[7,.04],[3,.14],[1.2,.65]])g.lineStyle(width,jade,alpha).strokePoints(points);
 for(let i=1;i<=4;i++){const p=points[i*5];leaf(g,p.x,p.y,4.5,side*(i%2?.9:-.8),i%2?jade:gold)}
}

/** Local wards follow each living ally; no fixed squad-sized bubble. */
export class GroveAegis {
 private wards:{aura:Phaser.GameObjects.Container;crest:Phaser.GameObjects.Container}[]=[];
 private active=false;
 constructor(private scene:Phaser.Scene,private heroes:HeroSprite[],private speed:()=>number){
  heroes.forEach(sprite=>{
   const size=sprite.displayHeight,g=scene.add.graphics();
   g.fillStyle(jade,.08).fillEllipse(0,-2,size*.8,19);
   g.lineStyle(1,jade,.55).strokeEllipse(0,-2,size*.8,19).lineStyle(.6,gold,.5).strokeEllipse(0,-2,size*.68,13);
   for(let i=0;i<8;i++){const a=i*Math.PI/4;g.lineStyle(1.2,gold,.75).lineBetween(Math.cos(a)*size*.38,Math.sin(a)*9-2,Math.cos(a)*size*.43,Math.sin(a)*12-2)}
   vine(g,-1,size);vine(g,1,size);
   const aura=scene.add.container(0,0,[g]).setAlpha(0).setVisible(false);
   const emblem=scene.add.graphics();
   const shield=[new Phaser.Math.Vector2(0,-22),new Phaser.Math.Vector2(17,-14),new Phaser.Math.Vector2(15,6),new Phaser.Math.Vector2(8,17),new Phaser.Math.Vector2(0,23),new Phaser.Math.Vector2(-8,17),new Phaser.Math.Vector2(-15,6),new Phaser.Math.Vector2(-17,-14)];
   emblem.fillStyle(0x164e3c,.78).fillPoints(shield,true).lineStyle(5,jade,.1).strokePoints(shield,true).lineStyle(1.3,gold,.95).strokePoints(shield,true);
   emblem.lineStyle(.7,jade,.65).strokePoints(shield.map(p=>p.clone().scale(.8)),true);
   emblem.fillStyle(jade,.95).fillPoints([new Phaser.Math.Vector2(0,-12),new Phaser.Math.Vector2(6,-1),new Phaser.Math.Vector2(0,10),new Phaser.Math.Vector2(-6,-1)],true);
   emblem.lineStyle(1,pale,.9).lineBetween(0,-10,0,7);leaf(emblem,-8,6,4,-.7,gold);leaf(emblem,8,6,4,.7,gold);
   const crest=scene.add.container(0,0,[emblem]).setAlpha(0).setVisible(false).setScale(.78);
   scene.tweens.add({targets:g,alpha:.55,duration:1450,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
   this.wards.push({aura,crest});
  });
 }
 update(){
  this.heroes.forEach((sprite,i)=>{
   const {aura,crest}=this.wards[i];
   aura.setPosition(sprite.x,sprite.y).setDepth(sprite.depth-1);
   crest.setPosition(sprite.x+sprite.displayWidth*.3,sprite.y-sprite.displayHeight*.42).setDepth(sprite.depth+1);
  });
 }
 sync(enabled:boolean,living:boolean[]){
  if(enabled===this.active){this.wards.forEach((w,i)=>{if(!living[i]){w.aura.setVisible(false);w.crest.setVisible(false)}});return}
  this.active=enabled;
  this.wards.forEach(({aura,crest},i)=>{
   this.scene.tweens.killTweensOf([aura,crest]);
   if(enabled&&living[i]){
    aura.setVisible(true).setAlpha(0);crest.setVisible(true).setAlpha(0);
    this.scene.tweens.add({targets:[aura,crest],alpha:1,duration:500/this.speed(),ease:'Sine.easeOut'});
   }else this.scene.tweens.add({targets:[aura,crest],alpha:0,duration:300/this.speed(),onComplete:()=>{aura.setVisible(false);crest.setVisible(false)}});
  });
 }
 private leaves(x:number,y:number,count:number){
  for(let i=0;i<count;i++){
   const a=i/count*Math.PI*2,particle=this.scene.add.graphics().setPosition(x,y).setDepth(1490);leaf(particle,0,0,3+i%3,a,i%3?jade:gold);
   this.scene.tweens.add({targets:particle,x:x+Math.cos(a)*(28+i%4*6),y:y-25-Math.sin(a)*18-i%5*6,rotation:a*.4,alpha:0,duration:(750+i%4*100)/this.speed(),ease:'Sine.easeOut',onComplete:()=>particle.destroy()});
  }
 }
 cast(){
  const caster=this.heroes[2],home=caster.getData('home') as {x:number;y:number};
  const sigil=this.scene.add.graphics().setPosition(home.x,home.y-3).setDepth(caster.depth-2).setAlpha(0).setScale(.65);
  sigil.fillStyle(jade,.09).fillEllipse(0,0,145,42).lineStyle(2,jade,.8).strokeEllipse(0,0,145,42).lineStyle(1,gold,.9).strokeEllipse(0,0,123,32);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;leaf(sigil,Math.cos(a)*68,Math.sin(a)*19,4,a,gold)}
  this.scene.tweens.add({targets:sigil,alpha:1,scale:1,duration:260/this.speed(),ease:'Back.easeOut',onComplete:()=>this.scene.tweens.add({targets:sigil,alpha:0,scale:1.2,duration:1100/this.speed(),onComplete:()=>sigil.destroy()})});
  this.leaves(home.x,home.y-40,18);
  this.heroes.forEach((sprite,i)=>{
   if(sprite.alpha<.5)return;
   const target=sprite.getData('home') as {x:number;y:number};
   const curve=new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(home.x,home.y-38),new Phaser.Math.Vector2((home.x+target.x)/2,Math.min(home.y,target.y)-115),new Phaser.Math.Vector2(target.x,target.y-45));
   const trail=this.scene.add.graphics().setDepth(1480);
   trail.lineStyle(5,jade,.06).strokePoints(curve.getPoints(32)).lineStyle(1.1,jade,.45).strokePoints(curve.getPoints(32));
   const seed=this.scene.add.graphics().setDepth(1490);seed.fillStyle(jade,.12).fillCircle(0,0,10).fillStyle(pale,.85).fillCircle(0,0,2.5);leaf(seed,0,0,5,.6);
   const start=curve.getStartPoint();seed.setPosition(start.x,start.y);trail.setAlpha(0);
   this.scene.tweens.add({targets:trail,alpha:1,duration:180/this.speed(),delay:i*35/this.speed()});
   this.scene.tweens.addCounter({from:0,to:1,duration:480/this.speed(),delay:i*35/this.speed(),onUpdate:tween=>{const p=curve.getPoint(tween.getValue()??0);seed.setPosition(p.x,p.y)},onComplete:()=>{seed.destroy();this.leaves(target.x,target.y-40,7);this.scene.tweens.add({targets:trail,alpha:0,duration:400/this.speed(),onComplete:()=>trail.destroy()})}});
  });
 }
 impact(i:number){
  if(!this.active)return;const sprite=this.heroes[i],{crest}=this.wards[i];
  this.leaves(sprite.x+sprite.displayWidth*.3,sprite.y-sprite.displayHeight*.42,5);
  this.scene.tweens.add({targets:crest,scale:1,duration:110/this.speed(),yoyo:true,ease:'Sine.easeOut'});
 }
}
