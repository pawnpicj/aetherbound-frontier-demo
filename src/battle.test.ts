import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from './battle';
import {heroFormation,encounters,battlefield} from './encounter';
import {createFormation,swapHeroIntoSlot,nearestFormationSlot,loadFormation,saveFormation} from './formation';
import {newChapter,loadChapter,saveChapter,summonFirstCompanion,companionIds} from './chapter';
const clear=(b:Battle)=>{for(const e of b.enemies)b.hit(0,e.maxHp,1000,e.id)};
test('chapter first summon selects one companion and never rerolls a claimed result',()=>{
 companionIds.forEach((id,i)=>{const state=summonFirstCompanion(newChapter(),i/4);assert.equal(state.companion,id);assert.equal(state.step,8);assert.equal(summonFirstCompanion(state,.99).companion,id)});
});
test('chapter progress and first companion persist while malformed saves fall back safely',()=>{
 let saved:string|null=null;const storage={getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value}};
 const state={...summonFirstCompanion(newChapter(),.5),completed:true};saveChapter(state,storage);assert.deepEqual(loadChapter(storage),state);
 for(const value of ['bad','null','{}',JSON.stringify({...state,companion:null}),JSON.stringify({...state,companion:'unknown'}),JSON.stringify({...state,step:99})]){saved=value;assert.deepEqual(loadChapter(storage),newChapter())}
 assert.deepEqual(loadChapter({getItem:()=>{throw Error('blocked')}}),newChapter());
});
test('saved formation restores slot assignments, validates storage and persists reset',()=>{
 let saved:string|null=null;const storage={getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value}};
 const moved=swapHeroIntoSlot(createFormation(),0,1);assert.ok(saveFormation(moved,storage));assert.deepEqual(loadFormation(storage),moved);
 assert.ok(saveFormation(createFormation(),storage));assert.deepEqual(loadFormation(storage),createFormation());
 for(const value of ['bad JSON','null','{}','[0,0,2,3,4]','[0,1,2,3]','[0,1,2,3,99]','[0,1,2,3,"4"]']){saved=value;assert.deepEqual(loadFormation(storage),createFormation())}
 const blocked={getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')}};assert.deepEqual(loadFormation(blocked),createFormation());assert.equal(saveFormation(moved,blocked),false);
});
test('formation swaps only between five fixed slots, preserving hero sizes and one hero per slot',()=>{
 const initial=createFormation(),swapped=swapHeroIntoSlot(initial,0,1);
 assert.deepEqual([swapped[0].x,swapped[0].y],[initial[1].x,initial[1].y]);assert.deepEqual([swapped[1].x,swapped[1].y],[initial[0].x,initial[0].y]);
 assert.equal(swapped[0].size,initial[0].size);assert.equal(swapped[1].size,initial[1].size);assert.deepEqual(initial,heroFormation);
 let current=swapped;for(let hero=0;hero<5;hero++)for(let slot=0;slot<5;slot++){current=swapHeroIntoSlot(current,hero,slot);assert.equal(new Set(current.map(p=>`${p.x},${p.y}`)).size,5);assert.ok(current.every(p=>heroFormation.some(s=>s.x===p.x&&s.y===p.y)))}
 assert.equal(swapHeroIntoSlot(initial,0,0),initial);assert.equal(swapHeroIntoSlot(initial,-1,0),initial);assert.equal(swapHeroIntoSlot(initial,0,99),initial);
});
function atRound(index:number){const b=new Battle();while(b.waveIndex<index){clear(b);assert.ok(b.advanceWave())}return b}
test('formation drops snap to nearby fixed slots and reject empty or enemy space',()=>{
 heroFormation.forEach((p,i)=>{assert.equal(nearestFormationSlot(p.x,p.y),i);assert.equal(nearestFormationSlot(p.x+12,p.y-8),i)});
 assert.equal(nearestFormationSlot(800,400),null);assert.equal(nearestFormationSlot(350,100),null);assert.equal(nearestFormationSlot(-200,300),null);
});
test('three distinct formations: monsters only, boss only, boss behind the middle',()=>{
 assert.deepEqual(encounters.map(e=>e.formation.length),[5,1,6]);assert.equal(heroFormation.length,5);
 for(const round of encounters)for(const p of [...heroFormation,...round.formation]){assert.ok(p.x-p.size/2>=0&&p.x+p.size/2<=battlefield.width);assert.ok(p.y-p.size*.9>=0&&p.y+p.size*.1<=battlefield.height)}
 const mixed=encounters[2].formation,boss=mixed.find(p=>p.id==='boss')!,monsters=mixed.filter(p=>p.id!=='boss');assert.ok(monsters.every(p=>p.x<boss.x));assert.equal(boss.y,(Math.min(...monsters.map(p=>p.y))+Math.max(...monsters.map(p=>p.y)))/2);
});
test('starts with only five monsters and cannot advance before clearing',()=>{const b=new Battle();assert.equal(b.boss,undefined);assert.equal(b.bossHp,0);assert.equal(b.enemies.length,5);assert.equal(b.advanceWave(),false);assert.equal(b.selectTarget('boss'),false);const r=b.enemyTurn();assert.equal(r.attackerIds.length,5);assert.ok(!r.attackerIds.includes('boss'));assert.equal(r.hits.reduce((s,h)=>s+h.damage,0),420)});
test('clearing a round pauses actions and damage; only the final round wins',()=>{const b=new Battle();clear(b);assert.equal(b.status,'wave-clear');assert.equal(b.act(1),null);assert.equal(b.hit(1,100,5000).damage,0);assert.equal(b.enemyTurn().attackerIds.length,0);assert.ok(b.advanceWave());assert.equal(b.waveIndex,1);assert.equal(b.status,'playing');assert.equal(b.enemies.length,1);assert.equal(b.target!.id,'boss');clear(b);assert.equal(b.status,'wave-clear');assert.ok(b.advanceWave());assert.equal(b.waveIndex,2);assert.equal(b.enemies.length,6);clear(b);assert.equal(b.status,'victory');assert.equal(b.advanceWave(),false)});
test('transition carries the squad, recovers living heroes and clears transient turn state',()=>{const b=new Battle(),heroes=b.heroes;b.heroes[0].hp=100;b.heroes[0].bb=5;b.heroes[1].hp=0;b.heroes[1].bb=10;b.heroes[2].bb=99;b.shield=true;b.guard=true;b.heroes.forEach(h=>h.acted=true);clear(b);const damage=b.damage;assert.ok(b.advanceWave());assert.equal(b.heroes,heroes);assert.equal(b.heroes[0].hp,730);assert.equal(b.heroes[0].bb,25);assert.equal(b.heroes[1].hp,0);assert.equal(b.heroes[1].bb,10);assert.equal(b.heroes[2].bb,100);assert.equal(b.damage,damage);assert.equal(b.roundTurn,1);assert.equal(b.guard,false);assert.equal(b.shield,false);assert.ok(b.canAct(0));assert.equal(b.advanceWave(),false)});
test('solo boss attacks alone and Cataclysm follows the current round turn',()=>{const b=atRound(1);b.roundTurn=3;const r=b.enemyTurn();assert.equal(r.heavy,true);assert.deepEqual(r.attackerIds,['boss']);assert.equal(r.hits.length,5);assert.equal(r.hits.reduce((s,h)=>s+h.damage,0),2600);assert.equal(b.roundTurn,4)});
test('mixed round still needs the monsters after its boss is defeated; retargets living enemies',()=>{const b=atRound(2);assert.ok(b.selectTarget('boss'));const a=b.act(0)!;assert.equal(a.targetId,'boss');b.hit(0,15000,1,a.targetId);assert.equal(b.bossHp,0);assert.equal(b.status,'playing');assert.equal(b.selectedTarget,'bramble-1');assert.equal(b.selectTarget('boss'),false);assert.equal(b.selectTarget('unknown'),false);const r=b.enemyTurn();assert.ok(!r.attackerIds.includes('boss'));clear(b);assert.equal(b.status,'victory')});
test('Spark requires different heroes on the same target close together',()=>{const b=new Battle();assert.equal(b.hit(0,100,100,'bramble-1').spark,false);assert.equal(b.hit(0,100,150,'bramble-1').spark,false);assert.equal(b.hit(1,100,180,'wisp-1').spark,false);const hit=b.hit(1,100,200,'bramble-1');assert.equal(hit.spark,true);assert.equal(hit.damage,150);assert.equal(b.hit(2,100,500,'bramble-1').spark,false)});
test('damage Burst splashes 15%; support Bursts shield and heal without reviving',()=>{const b=new Battle();const a=b.act(0,true)!;assert.equal(a.aoe,true);assert.equal(b.heroes[0].bb,0);assert.equal(b.act(0),null);const hit=b.hit(0,100,1,a.targetId,a.aoe);assert.equal(hit.hits.length,5);assert.equal(hit.hits[0].damage,100);assert.ok(hit.hits.slice(1).every(x=>x.damage===15));b.heroes[1].hp=0;b.heroes[3].hp=100;b.heroes[4].bb=100;assert.equal(b.act(4,true)!.aoe,false);assert.equal(b.heroes[1].hp,0);assert.equal(b.heroes[3].hp,750);b.act(2,true);assert.ok(b.shield)});
test('guard and shield reduce damage from the mixed wave; defeated enemies cannot attack',()=>{const a=atRound(2),b=atRound(2);a.roundTurn=b.roundTurn=3;b.guard=true;b.shield=true;assert.equal(a.enemyTurn().hits.reduce((s,h)=>s+h.damage,0),3020);assert.ok(b.enemyTurn().hits.reduce((s,h)=>s+h.damage,0)<540);assert.equal(b.shield,false);assert.equal(b.guard,false);const c=new Battle();c.minions[0].hp=0;assert.ok(!c.enemyTurn().attackerIds.includes('bramble-1'))});
test('individual Guard uses one action, protects only that hero and expires after enemy attacks',()=>{
 const guarded=atRound(1),plain=atRound(1);guarded.roundTurn=plain.roundTurn=3;
 assert.ok(guarded.guardHero(0));assert.equal(guarded.canAct(0),false);assert.equal(guarded.act(0),null);assert.equal(guarded.guardHero(0),false);
 const protectedHits=guarded.enemyTurn().hits,normalHits=plain.enemyTurn().hits;
 assert.equal(protectedHits.find(h=>h.i===0)!.damage,182);
 for(let i=1;i<5;i++)assert.equal(protectedHits.find(h=>h.i===i)!.damage,normalHits.find(h=>h.i===i)!.damage);
 assert.equal(guarded.heroes[0].guarding,false);assert.ok(guarded.canAct(0));
 guarded.heroes[1].hp=0;assert.equal(guarded.guardHero(1),false);assert.equal(guarded.guardHero(-1),false);
 assert.ok(guarded.guardHero(2));clear(guarded);assert.equal(guarded.guardHero(3),false);assert.ok(guarded.advanceWave());assert.equal(guarded.heroes[2].guarding,false);
});
test('a coordinated squad wins all three waves; unattended squad loses; restart starts round one',()=>{
 const b=new Battle(),seen=new Set<number>();let clock=0;
 while(b.status!=='victory'&&b.status!=='defeat'&&b.turn<80){seen.add(b.waveIndex);if(b.status==='wave-clear'){b.advanceWave();continue}const actions=b.heroes.map((h,i)=>({i,a:b.act(i,h.bb===100)}));for(let hit=0;hit<6;hit++)for(const {i,a} of actions)if(a&&hit<a.hits)b.hit(i,a.power/a.hits,clock+=15,a.targetId,a.aoe);b.enemyTurn()}
 assert.equal(b.status,'victory');assert.equal(seen.size,3);assert.ok(b.sparks>0);assert.equal(b.livingEnemies.length,0);
 const lost=new Battle();for(let i=0;i<100&&lost.status==='playing';i++)lost.enemyTurn();assert.equal(lost.status,'defeat');assert.equal(lost.advanceWave(),false);
 const fresh=new Battle();assert.equal(fresh.waveIndex,0);assert.equal(fresh.enemies.length,5);assert.equal(fresh.turn,1);assert.ok(fresh.heroes.every(h=>h.hp===h.maxHp));
});
