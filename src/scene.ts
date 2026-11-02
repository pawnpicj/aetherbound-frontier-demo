import Phaser from 'phaser';
import type {Battle,DamageHit} from './battle';
import {sanctuaryEnvironment} from './environment';
import {heroDesigns,bossDesign} from './characters';
import {battlefield,heroFormation,monsterArt} from './encounter';
import type {HeroPosition} from './formation';
import {nearestFormationSlot} from './formation';
import {GroveAegis} from './grove-aegis';
type Sprite=Phaser.GameObjects.Image;
const number=(hex:string)=>Phaser.Display.Color.HexStringToColor(hex).color;
export class BattleScene extends Phaser.Scene {
 ready=false;heroes:Sprite[]=[];enemies=new Map<string,Sprite>();
 aegis!:GroveAegis;selection!:Phaser.GameObjects.Ellipse;
 bars!:Phaser.GameObjects.Graphics;labels=new Map<string,Phaser.GameObjects.Text>();
 backdrop!:Phaser.GameObjects.Image;
 placement!:Phaser.GameObjects.Ellipse;
 constructor(private state:()=>{battle:Battle;speed:number;renderScale:number;fieldWidth:number;formation:HeroPosition[];arranging:boolean;selectedHero:number},private onHeroClick:(i:number)=>void,private onReady:()=>void,private onTargetClick:(id:string)=>void,private onHeroDrop:(i:number,slot:number|null)=>void){super('battle')}
 get battle(){return this.state().battle} get speed(){return this.state().speed}
 get renderScale(){return this.state().renderScale}
 get fieldWidth(){return this.state().fieldWidth}
 worldX(x:number){return x*this.fieldWidth/battlefield.width}
 updateViewport(){
  this.cameras.main.setSize(Math.round(this.fieldWidth*this.renderScale),battlefield.height*this.renderScale).setZoom(this.renderScale).centerOn(this.fieldWidth/2,battlefield.height/2);
  for(const sprite of [...this.heroes,...this.enemies.values()]){const home=sprite.getData('home'),next=this.worldX(sprite.getData('baseX'));sprite.x+=next-home.x;home.x=next}
  for(const [id,label] of this.labels)label.x=this.enemies.get(id)!.getData('home').x;
  if(this.backdrop?.active)this.backdrop.setPosition(this.fieldWidth/2,240).setDisplaySize(Math.max(2000,this.fieldWidth),Math.max(2000,this.fieldWidth)/2.5);
  for(const object of this.children.list)if(object instanceof Phaser.GameObjects.Text)object.setResolution(this.renderScale);
 }
 later(ms:number,fn:()=>void){this.time.delayedCall(ms/this.speed,fn)}
 moveHero(i:number,p:HeroPosition){
  if(!this.ready)return;const sprite=this.heroes[i];
  (sprite.getData('idleTween') as Phaser.Tweens.Tween).stop();
  const x=this.worldX(p.x);sprite.setPosition(x,p.y).setData({baseX:p.x,home:{x,y:p.y}});
  sprite.setData('idleTween',this.tweens.add({targets:sprite,y:p.y-3,duration:1500+i*100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
 }
 preload(){
  this.ready=false;this.load.image(sanctuaryEnvironment.texture,sanctuaryEnvironment.url);
  for(const design of [...heroDesigns,bossDesign])this.load.spritesheet(design.id+'-painted',design.atlas,{frameWidth:512,frameHeight:512});
  for(const [id,art] of Object.entries(monsterArt))this.load.spritesheet(id+'-painted',art.atlas,{frameWidth:512,frameHeight:512});
 }
 makeSprite(x:number,y:number,size:number,texture:string,index:number){
  const baseX=x;x=this.worldX(x);
  const shadow=this.add.ellipse(x,y-2,size*.45,size*.07,0x071d28,.25).setDepth(10);
  const sprite=this.add.image(x,y,texture,0).setDisplaySize(size,size).setOrigin(.5,.9).setInteractive({useHandCursor:true});
  sprite.setData({baseX,home:{x,y},shadow,idleTween:this.tweens.add({targets:sprite,y:y-3,duration:1500+index*100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})});
  return sprite;
 }
 create(){
  this.heroes=[];this.enemies=new Map();this.labels=new Map();
  this.updateViewport();
  this.backdrop=this.add.image(this.fieldWidth/2,240,sanctuaryEnvironment.texture).setDisplaySize(Math.max(2000,this.fieldWidth),Math.max(2000,this.fieldWidth)/2.5);
  for(let i=0;i<18;i++){const mote=this.add.circle(Phaser.Math.Between(50,1150),Phaser.Math.Between(120,570),1.6,0xd8e7bb,.4);this.tweens.add({targets:mote,y:mote.y-55,alpha:.04,duration:4200+i*90,yoyo:true,repeat:-1})}
  this.selection=this.add.ellipse(0,0,100,22,0xe6ce85,.13).setStrokeStyle(2,0xf5dda5,.9).setDepth(25);
  this.placement=this.add.ellipse(0,0,105,24,0xaedfc1,.12).setStrokeStyle(2,0xbbe8c8,.9).setDepth(25);
  this.input.dragDistanceThreshold=6;
  heroDesigns.forEach((design,i)=>{const p=this.state().formation[i],sprite=this.makeSprite(p.x,p.y,p.size,design.id+'-painted',i);
   sprite.on('pointerdown',()=>this.onHeroClick(i));
   sprite.on('dragstart',()=>{if(!this.state().arranging)return;sprite.setData('dragging',true);(sprite.getData('idleTween') as Phaser.Tweens.Tween).pause()});
   sprite.on('drag',(_pointer:Phaser.Input.Pointer,x:number,y:number)=>{
    if(!this.state().arranging)return;sprite.setPosition(x,y);
    const slot=nearestFormationSlot(x/this.fieldWidth*battlefield.width,y);this.placement.setVisible(slot!==null);
    if(slot!==null){const p=heroFormation[slot];this.placement.setPosition(this.worldX(p.x),p.y)}
   });
   sprite.on('dragend',()=>{sprite.setData('dragging',false);if(this.state().arranging)this.onHeroDrop(i,nearestFormationSlot(sprite.x/this.fieldWidth*battlefield.width,sprite.y))});
   this.heroes.push(sprite);
  });
  this.aegis=new GroveAegis(this,this.heroes,()=>this.speed);
  this.battle.wave.formation.forEach((p,i)=>{const enemy=this.battle.enemies.find(e=>e.id===p.id)!,sprite=this.makeSprite(p.x,p.y,p.size,enemy.variant+'-painted',i);sprite.on('pointerdown',()=>this.onTargetClick(p.id));this.enemies.set(p.id,sprite);if(!enemy.boss)this.labels.set(p.id,this.add.text(this.worldX(p.x),p.y+(p.y>battlefield.height-40?1:15),enemy.shortName,{fontFamily:'DM Sans, sans-serif',fontSize:p.y>battlefield.height-40?'12px':'14px',fontStyle:'bold',color:'#eff2df',stroke:'#16343a',strokeThickness:2,resolution:this.renderScale}).setOrigin(.5,0).setDepth(1450))});
  this.bars=this.add.graphics().setDepth(1450);this.ready=true;this.sync();this.onReady();this.events.once('shutdown',()=>this.ready=false);
 }
 update(){if(!this.ready)return;for(const sprite of [...this.heroes,...this.enemies.values()]){sprite.setDepth(100+Math.round(sprite.y)+(sprite.getData('acting')||sprite.getData('dragging')?650:0));(sprite.getData('shadow') as Phaser.GameObjects.Ellipse).setPosition(sprite.x,sprite.y-2)}this.aegis.update()}
 sync(){
  if(!this.ready)return;
  const {arranging,selectedHero}=this.state();
  this.heroes.forEach(sprite=>this.input.setDraggable(sprite,arranging));
  if(!this.heroes.some(sprite=>sprite.getData('dragging'))){this.placement.setVisible(arranging);if(arranging){const home=this.heroes[selectedHero].getData('home');this.placement.setPosition(home.x,home.y)}}
  this.heroes.forEach((sprite,i)=>{const h=this.battle.heroes[i];sprite.setAlpha(h.hp<=0?.4:h.acted?.82:1);if(h.hp<=0){sprite.setFrame(5);(sprite.getData('idleTween') as Phaser.Tweens.Tween).pause()}});
  this.aegis.sync(this.battle.shield,this.battle.heroes.map(h=>h.hp>0));this.bars.clear();
  for(const enemy of this.battle.enemies){const sprite=this.enemies.get(enemy.id)!;
   if(enemy.hp<=0){sprite.setFrame(5).setAlpha(.3).disableInteractive();(sprite.getData('idleTween') as Phaser.Tweens.Tween).pause()}
   if(!enemy.boss){const home=sprite.getData('home');this.bars.fillStyle(0x122c30,.85).fillRoundedRect(home.x-39,home.y+(home.y>battlefield.height-40?-7:5),78,6,2);this.bars.fillStyle(enemy.variant==='wisp'?0xb397d6:0xa0bd83).fillRoundedRect(home.x-38,home.y+(home.y>battlefield.height-40?-6:6),76*enemy.hp/enemy.maxHp,4,1);this.labels.get(enemy.id)!.setAlpha(enemy.hp>0?1:.4)}
  }
  const target=this.battle.target,sprite=target&&this.enemies.get(target.id);this.selection.setVisible(!!sprite&&this.battle.status==='playing');if(sprite)this.selection.setPosition(sprite.x,sprite.getData('home').y).setDisplaySize(target!.boss?175:100,target!.boss?30:22);
 }
 strike(i:number,burst:boolean,targetId:string){
  const target=this.enemies.get(targetId)!;const enemy=this.battle.enemies.find(e=>e.id===targetId)!;
  const x=target.getData('home').x,y=target.getData('home').y-(enemy.boss?145:55);
  const sprite=this.heroes[i],home=sprite.getData('home'),idle=sprite.getData('idleTween') as Phaser.Tweens.Tween,color=heroDesigns[i].color;
  idle.pause();sprite.setData('acting',true).setFrame(burst?3:1);
  if(burst){if(i!==2)this.ring(home.x,home.y-45,color,40,850);this.float(home.x+20,home.y-165,this.battle.heroes[i].skill,color,15)}
  const melee=i===0||i===3||(i===2&&!burst);
  if(melee){
   this.later(130,()=>this.tweens.add({targets:sprite,x:x+(i===3?60:-85),y:y+50+(i===2?35:0),duration:190/this.speed,ease:'Cubic.easeIn'}));
   this.later(345,()=>{sprite.setFrame(2);this.slash(x,y,color,burst?95:65,i===3?-20:0);if(i===3)this.slash(x,y+15,'#e0cdff',65,140);if(burst)this.ring(x,y,color,65,550)});
  }else this.later(230,()=>{sprite.setFrame(burst?3:2);if(i===2&&burst)this.aegis.cast();else{const projectile=this.add.circle(home.x+30,home.y-75,burst?11:7,number(color),.95).setDepth(1500);this.tweens.add({targets:projectile,x,y,duration:160/this.speed,onComplete:()=>{projectile.destroy();this.ring(x,y,color,burst?60:30,500)}})}if(i===4&&burst)this.heroes.forEach((s,n)=>{if(this.battle.heroes[n].hp>0)this.ring(s.x,s.y-30,color,35,1000)})});
  this.later(burst?1040:760,()=>{sprite.setFrame(this.battle.heroes[i].hp>0?0:5);this.tweens.add({targets:sprite,x:home.x,y:home.y,duration:230/this.speed,onComplete:()=>{sprite.setData('acting',false);if(this.battle.heroes[i].hp>0)idle.resume()}})});
 }
 impact(i:number,hit:DamageHit,burst:boolean){
  const sprite=this.enemies.get(hit.targetId)!,enemy=this.battle.enemies.find(e=>e.id===hit.targetId)!,home=sprite.getData('home');
  const x=home.x+Phaser.Math.Between(-22,22),y=home.y-(enemy.boss?170:80)+Phaser.Math.Between(-20,15);
  this.float(x,y,String(hit.damage),hit.spark?'#ffe3a0':'#ffffff',hit.spark?25:20);this.ring(x,y+20,heroDesigns[i].color,burst?25:15,260);
  sprite.setTint(hit.spark?0xffebbc:0xe0daec).setFrame(enemy.hp>0?4:5);
  const token=(sprite.getData('hitToken')??0)+1;sprite.setData('hitToken',token);this.later(150,()=>{if(sprite.getData('hitToken')===token)sprite.clearTint().setFrame(enemy.hp>0?0:5)});
  if(burst)this.cameras.main.shake(60,.0015);
 }
 enemyAttack(heavy:boolean){
  for(const enemy of this.battle.livingEnemies){
   const sprite=this.enemies.get(enemy.id)!,home=sprite.getData('home'),idle=sprite.getData('idleTween') as Phaser.Tweens.Tween;idle.pause();sprite.setFrame(enemy.boss&&heavy?3:1);
   if(enemy.boss&&heavy){this.float(home.x,home.y-300,'CATACLYSM','#e6c1ef',25);this.ring(home.x,home.y-130,'#c09bea',80,700)}
   this.later(240,()=>{sprite.setFrame(enemy.boss&&heavy?3:2);const alive=this.heroes.filter((_,i)=>this.battle.heroes[i].hp>0);const victim=alive[(this.battle.turn+this.battle.enemies.indexOf(enemy))%alive.length];if(!victim)return;const pulse=this.add.circle(home.x-30,home.y-55,enemy.boss?22:9,enemy.variant==='bramble'?0xb7cb85:0xbb8fe0,.6).setDepth(1500);this.tweens.add({targets:pulse,x:victim.x,y:victim.y-45,alpha:0,duration:360/this.speed,onComplete:()=>pulse.destroy()})});
   this.later(910,()=>{sprite.setFrame(enemy.hp>0?0:5);if(enemy.hp>0)idle.resume()});
  }
  this.later(260,()=>this.cameras.main.shake(heavy?250:100,heavy?.006:.002));
 }
 heroDamage(i:number,damage:number){this.aegis.impact(i);const sprite=this.heroes[i];this.float(sprite.x,sprite.y-65,`−${damage}`,'#ffac99',22);sprite.setFrame(this.battle.heroes[i].hp>0?4:5);this.later(500,()=>{if(!sprite.getData('acting'))sprite.setFrame(this.battle.heroes[i].hp>0?0:5)});this.tweens.add({targets:sprite,x:sprite.x-10,duration:80/this.speed,yoyo:true,repeat:1})}
 heal(){this.heroes.forEach((sprite,i)=>{if(this.battle.heroes[i].hp>0)this.float(sprite.x,sprite.y-65,'+650','#f4e5ad',22)})}
 ring(x:number,y:number,color:string,radius:number,duration:number){const ring=this.add.circle(x,y,radius,number(color),.08).setStrokeStyle(2,number(color),.75).setDepth(1500);this.tweens.add({targets:ring,scale:1.7,alpha:0,duration:duration/this.speed,onComplete:()=>ring.destroy()})}
 slash(x:number,y:number,color:string,radius:number,rotation:number){const arc=this.add.graphics().lineStyle(6,number(color),.85).setDepth(1500);arc.beginPath();arc.arc(x,y,radius,Phaser.Math.DegToRad(205+rotation),Phaser.Math.DegToRad(335+rotation));arc.strokePath();this.tweens.add({targets:arc,alpha:0,duration:330/this.speed,onComplete:()=>arc.destroy()})}
 float(x:number,y:number,text:string,color:string,size=24){const label=this.add.text(x,y,text,{fontFamily:'DM Sans, sans-serif',fontStyle:'bold',fontSize:`${size}px`,color,stroke:'#16343a',strokeThickness:3,resolution:this.renderScale}).setOrigin(.5).setDepth(2000);this.tweens.add({targets:label,y:y-40,alpha:0,duration:1000/this.speed,onComplete:()=>label.destroy()})}
}
