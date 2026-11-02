import Phaser from 'phaser';
import type {Battle} from './battle';
import {sanctuaryEnvironment} from './environment';
import {heroDesigns,bossDesign} from './characters';
type State=()=>{battle:Battle;speed:number};
const colorNumber=(hex:string)=>Phaser.Display.Color.HexStringToColor(hex).color;
export class BattleScene extends Phaser.Scene {
 ready=false;
 heroes:Phaser.GameObjects.Image[]=[];
 boss!:Phaser.GameObjects.Image;
 shield!:Phaser.GameObjects.Ellipse;
 backdrop!:Phaser.GameObjects.Image;
 constructor(private state:State,private onHeroClick:(i:number)=>void,private onReady:()=>void){super('battle')}
 get battle(){return this.state().battle}
 get speed(){return this.state().speed}
 later(ms:number,fn:()=>void){this.time.delayedCall(ms/this.speed,fn)}
 preload(){
  this.ready=false;
  this.load.image(sanctuaryEnvironment.texture,sanctuaryEnvironment.url);
  for(const design of [...heroDesigns,bossDesign])this.load.spritesheet(design.id+'-painted',design.atlas,{frameWidth:512,frameHeight:512});
 }
 create(){
  this.heroes=[];
  this.backdrop=this.add.image(600,240,sanctuaryEnvironment.texture).setDisplaySize(1200,480);
  const light=this.add.ellipse(610,160,170,100,0xe5e4bf,.025);
  this.tweens.add({targets:light,alpha:.065,scale:1.1,duration:4500,yoyo:true,repeat:-1});
  for(let i=0;i<20;i++){
   const mote=this.add.circle(Phaser.Math.Between(100,1100),Phaser.Math.Between(140,440),Phaser.Math.FloatBetween(1,2.4),0xd8e7bb,.45);
   this.tweens.add({targets:mote,y:mote.y-60,x:mote.x+25,alpha:.05,duration:Phaser.Math.Between(3500,6500),yoyo:true,repeat:-1,delay:i*150});
  }
  this.shield=this.add.ellipse(290,355,380,210,0x92dab7,.07).setStrokeStyle(2,0xa8e3be,.55).setVisible(false);
  const positions=[[195,387],[315,355],[165,462],[300,455],[424,420]];
  heroDesigns.forEach((design,i)=>{
   const [x,y]=positions[i];
   this.add.ellipse(x,y-2,i===2?98:78,15,0x071d28,.23);
   const sprite=this.add.image(x,y,design.id+'-painted',0).setDisplaySize(design.size,design.size).setOrigin(.5,.9).setInteractive({useHandCursor:true});
   sprite.on('pointerdown',()=>this.onHeroClick(i));sprite.setData('home',{x,y});
   sprite.setData('idleTween',this.tweens.add({targets:sprite,y:y-(i===1?5:2),duration:1500+i*140,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
   this.heroes.push(sprite);
  });
  this.add.ellipse(880,430,270,34,0x0c292e,.3);
  this.boss=this.add.image(880,435,'hollowguard-painted',0).setDisplaySize(bossDesign.size,bossDesign.size).setOrigin(.5,.9);
  this.boss.setData('idleTween',this.tweens.add({targets:this.boss,y:432,duration:1800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
  this.add.text(75,448,'I   ·   II   ·   III',{fontFamily:'Georgia',fontSize:'13px',color:'#b5c7ae'}).setAlpha(.45);
  const resize=()=>{const zoom=window.innerWidth<=580?.77:1;this.cameras.main.setZoom(zoom);this.backdrop.setDisplaySize(1200/zoom,480/zoom)};
  resize();window.addEventListener('resize',resize);this.events.once('shutdown',()=>{this.ready=false;window.removeEventListener('resize',resize)});
  this.ready=true;this.sync();this.onReady();
 }
 sync(){
  if(!this.ready)return;
  this.heroes.forEach((sprite,i)=>{
   const h=this.battle.heroes[i];sprite.setAlpha(h.hp<=0?.45:h.acted?.82:1);
   if(h.hp<=0){sprite.setFrame(5);(sprite.getData('idleTween') as Phaser.Tweens.Tween).pause()}
  });
  this.shield.setVisible(this.battle.shield);
  if(this.battle.status==='victory'){this.boss.setFrame(5).setAlpha(.65);(this.boss.getData('idleTween') as Phaser.Tweens.Tween).pause()}
 }
 strike(i:number,burst:boolean){
  if(i===0)this.melee(i,burst,710,372);
  else if(i===2&&!burst)this.melee(i,false,680,438);
  else if(i===3)this.melee(i,burst,765,420);
  else this.cast(i,burst);
  if(burst){const s=this.heroes[i],home=s.getData('home');this.ring(home.x,home.y-65,heroDesigns[i].color,48,850);this.float(home.x,home.y-160,this.battle.heroes[i].skill,heroDesigns[i].color,16)}
 }
 melee(i:number,burst:boolean,targetX:number,targetY:number){
  const sprite=this.heroes[i],home=sprite.getData('home'),idle=sprite.getData('idleTween') as Phaser.Tweens.Tween;
  idle.pause();sprite.setData('acting',true);sprite.setDepth(4+i).setFrame(burst?3:1);
  this.tweens.add({targets:sprite,x:home.x-12,angle:i===2?-2:-4,duration:140/this.speed,ease:'Sine.easeOut'});
  this.later(155,()=>{
   this.tweens.add({targets:sprite,x:targetX,y:targetY,angle:0,duration:(i===3?130:190)/this.speed,ease:'Cubic.easeIn'});
   this.motes(home.x+25,home.y-40,targetX,heroDesigns[i].color,12);
  });
  this.later(345,()=>{
   sprite.setFrame(2);
   if(i===2){this.ring(815,335,'#a6cf8d',55,450);this.cameras.main.shake(90,.003)}
   else{
    this.slash(860,300,heroDesigns[i].color,burst?130:98,i===3?-20:0);
    if(i===3)this.slash(858,315,'#e0cdff',95,140);
   }
   if(burst)this.ring(870,300,heroDesigns[i].color,76,600);
  });
  this.later(burst?1020:710,()=>{
   sprite.setFrame(0);
   this.tweens.add({targets:sprite,x:home.x,y:home.y,angle:0,duration:240/this.speed,ease:'Cubic.easeOut',onComplete:()=>{sprite.setDepth(0);sprite.setData('acting',false);if(this.battle.heroes[i].hp>0)idle.resume();else sprite.setFrame(5)}});
  });
 }
 cast(i:number,burst:boolean){
  const sprite=this.heroes[i],home=sprite.getData('home'),idle=sprite.getData('idleTween') as Phaser.Tweens.Tween;
  idle.pause();sprite.setData('acting',true);sprite.setFrame(1);
  this.tweens.add({targets:sprite,y:home.y-5,x:home.x-7,duration:160/this.speed,yoyo:true});
  this.later(230,()=>{
   sprite.setFrame(burst?3:2);
   const color=heroDesigns[i].color;
   if(i===2&&burst){
    this.ring(home.x,home.y-15,color,65,800);this.motes(home.x,home.y-15,home.x+120,color,12);
   }else{
    const projectile=this.add.circle(home.x+50,home.y-100,burst?13:8,colorNumber(color),.9).setDepth(5);
    const halo=this.add.circle(home.x+50,home.y-100,burst?23:15,colorNumber(color),.15).setDepth(5);
    this.tweens.add({targets:[projectile,halo],x:870,y:300,duration:160/this.speed,ease:'Cubic.easeIn',onComplete:()=>{projectile.destroy();halo.destroy();this.ring(870,300,color,burst?75:38,500)}});
    if(i===1&&burst){this.ring(home.x,home.y-70,'#8de5ff',65,900);this.motes(home.x,home.y-80,870,color,16)}
    if(i===4&&burst)this.heroes.forEach((s,n)=>{if(this.battle.heroes[n].hp>0)this.ring(s.x,s.y-40,color,40,1100)});
   }
  });
  this.later(burst?1080:770,()=>{sprite.setFrame(this.battle.heroes[i].hp>0?0:5).setData('acting',false);if(this.battle.heroes[i].hp>0)idle.resume()});
 }
 ring(x:number,y:number,color:string,radius:number,duration:number){const ring=this.add.circle(x,y,radius,colorNumber(color),.08).setStrokeStyle(2,colorNumber(color),.75).setDepth(3);this.tweens.add({targets:ring,scale:1.7,alpha:0,duration:duration/this.speed,onComplete:()=>ring.destroy()})}
 motes(x:number,y:number,targetX:number,color:string,count:number){for(let n=0;n<count;n++){const mote=this.add.circle(x,y,Phaser.Math.Between(2,4),colorNumber(color),.8).setDepth(3);this.tweens.add({targets:mote,x:Phaser.Math.Between(Math.min(x,targetX),Math.max(x,targetX)),y:y+Phaser.Math.Between(-70,30),alpha:0,duration:550/this.speed,delay:n*9/this.speed,onComplete:()=>mote.destroy()})}}
 slash(x:number,y:number,color:string,radius:number,rotation:number){const arc=this.add.graphics().lineStyle(7,colorNumber(color),.85).setDepth(3);arc.beginPath();arc.arc(x,y,radius,Phaser.Math.DegToRad(205+rotation),Phaser.Math.DegToRad(335+rotation));arc.strokePath();this.tweens.add({targets:arc,alpha:0,duration:330/this.speed,onComplete:()=>arc.destroy()})}
 impact(i:number,damage:number,spark:boolean,burst:boolean){
  const color=colorNumber(heroDesigns[i].color),x=880+Phaser.Math.Between(-55,55),y=285+Phaser.Math.Between(-65,55);
  this.float(x,y-30,String(damage),spark?'#ffe3a0':'#ffffff',spark?27:22);
  const slash=this.add.rectangle(x,y,burst?115:80,3,color).setRotation(Phaser.Math.FloatBetween(-1.4,1.4)).setDepth(5);
  this.tweens.add({targets:slash,alpha:0,scaleX:.2,duration:260/this.speed,onComplete:()=>slash.destroy()});
  this.motes(x,y,x+60,heroDesigns[i].color,6);
  this.boss.setTint(spark?0xffebbc:0xe0daec);
  if(this.battle.status!=='victory')this.boss.setFrame(4);
  const token=(this.boss.getData('hitToken')??0)+1;this.boss.setData('hitToken',token);
  this.later(150,()=>{if(this.boss.getData('hitToken')===token)this.boss.clearTint().setFrame(this.battle.status==='victory'?5:0)});
  if(burst)this.cameras.main.shake(60,.002);
 }
 float(x:number,y:number,text:string,color:string,size=24){const label=this.add.text(x,y,text,{fontFamily:'Georgia',fontSize:`${size}px`,color,stroke:'#16343a',strokeThickness:4}).setOrigin(.5).setDepth(15);this.tweens.add({targets:label,y:y-45,alpha:0,duration:1100/this.speed,onComplete:()=>label.destroy()})}
 enemyAttack(heavy:boolean){
  (this.boss.getData('idleTween') as Phaser.Tweens.Tween).pause();this.boss.setFrame(heavy?3:1);
  this.tweens.add({targets:this.boss,y:420,duration:200/this.speed});
  if(heavy){this.float(870,155,'CATACLYSM','#e6c1ef',28);this.ring(880,290,'#c09bea',95,700)}
  this.later(260,()=>{
   this.boss.setFrame(heavy?3:2);this.cameras.main.shake(heavy?300:130,heavy?.008:.003);
   const flash=this.add.rectangle(600,240,1200,480,heavy?0x9b6ebb:0xe8d1a0,.18).setDepth(7);
   this.tweens.add({targets:flash,alpha:0,duration:500/this.speed,onComplete:()=>flash.destroy()});
   this.tweens.add({targets:this.boss,x:heavy?855:810,y:435,duration:180/this.speed,yoyo:true});
   const pulse=this.add.ellipse(850,370,90,heavy?120:60,0xbb8fe0,.23).setDepth(2);
   this.tweens.add({targets:pulse,x:290,scale:heavy?2.5:1.5,alpha:0,duration:440/this.speed,onComplete:()=>pulse.destroy()});
  });
  this.later(960,()=>{this.boss.setFrame(this.battle.status==='victory'?5:0).setPosition(880,435);if(this.battle.status!=='victory')(this.boss.getData('idleTween') as Phaser.Tweens.Tween).resume()});
 }
 heroDamage(i:number,damage:number){const sprite=this.heroes[i];this.float(sprite.x,sprite.y-145,`−${damage}`,'#ffac99',23);sprite.setFrame(this.battle.heroes[i].hp>0?4:5);this.later(500,()=>{if(!sprite.getData('acting'))sprite.setFrame(this.battle.heroes[i].hp>0?0:5)});this.tweens.add({targets:sprite,x:sprite.x-15,duration:80/this.speed,yoyo:true,repeat:1})}
 heal(){this.heroes.forEach((sprite,i)=>{if(this.battle.heroes[i].hp>0)this.float(sprite.x,sprite.y-145,'+650','#f4e5ad',23)})}
}
