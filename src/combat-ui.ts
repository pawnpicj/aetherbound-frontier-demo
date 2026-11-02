import type {Hero} from './battle';
import {icons} from './art';
import {heroDesigns} from './characters';
import {battlefield,heroFormation} from './encounter';
import type {HeroPosition} from './formation';

export function fieldHud(h:Hero,i:number,p:HeroPosition=heroFormation[i]){
 const top=p.y-p.size*.9-48;
 return `<div class="field-hero-hud ${h.hp<=0?'fallen':''}" data-hud="${h.id}" style="left:${(p.x-45)/1200*100}%;top:${top/battlefield.height*100}%;--hero:${h.color}" role="group" aria-label="${h.name}: HP ${h.hp} / ${h.maxHp}, BB ${h.bb}%"><div class="field-hp-block"><div class="field-hp-line"><span>HP</span><b>${h.hp.toLocaleString()}<small> / ${h.maxHp.toLocaleString()}</small></b></div><div class="field-hp-track"><i style="width:${h.hp/h.maxHp*100}%"></i></div></div><span class="field-bb-value ${h.bb===100?'ready':''}" aria-label="BB ${h.bb}%"><small>BB</small><b>${h.bb}%</b></span></div>`;
}

export function heroCard(h:Hero,i:number,attackEnabled:boolean,burstEnabled:boolean){
 const ready=h.bb===100&&h.hp>0&&!h.acted;
 const state=h.hp<=0?'Fallen':h.acted?'Done':'Attack';
 const support=h.role==='Shield'?' · Reduces enemy damage by 50%':h.role==='Heal'?' · Heals living allies for 650 HP':' · Splash damage to other enemies';
 return `<article class="hero-card ${h.acted?'acted':''} ${h.guarding?'guarding':''} ${h.hp<=0?'fallen':''}" style="--hero:${h.color}" aria-label="${h.name}, ${h.role}">
 <div class="hero-portrait"><img src="${heroDesigns[i].portrait}" alt="${h.name}, ${h.title.toLowerCase()}"></div>
 <div class="hero-heading"><span class="element" title="${h.element}">${icons[h.element]}</span><div class="hero-name">${h.name}<small>${h.hp<=0?'Fallen':h.guarding?'Guarding':h.acted?'Action complete':h.role}</small></div></div>
 <span class="hero-level">LV. 10</span>
 <button class="view-character" data-view-character="${h.id}" aria-label="Explore ${h.name} character design">VIEW DESIGN ↗</button>
 <div class="hero-actions">
 <button class="attack-action" data-attack="${i}" aria-label="${h.name} Attack" title="${h.name} · Attack (${i+1})" ${attackEnabled?'':'disabled'}><span class="action-glyph attack-glyph" aria-hidden="true"></span><span class="action-label">${state}</span><kbd>${i+1}</kbd></button>
 <button data-burst="${i}" class="burst ${ready?'ready':''}" aria-label="${h.name} Brave Burst: ${h.skill}" title="${h.skill}${support} · ${h.bb===100?'BB READY':'Charge '+h.bb+'%'}" ${burstEnabled?'':'disabled'}><span class="action-glyph burst-glyph" aria-hidden="true"></span><span class="action-label">BB</span><span class="bb-charge">${h.bb===100?'READY':h.bb+'%'}</span></button>
 <button class="hero-guard" data-guard="${i}" aria-label="${h.name} Guard" aria-pressed="${h.guarding}" title="${h.name} · Guard: reduce incoming damage by 65% this turn" ${attackEnabled?'':'disabled'}><svg class="guard-glyph" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3 27 7v9c0 6-6 10-11 13C11 26 5 22 5 16V7L16 3Z" stroke="currentColor" stroke-width="2"/><path d="m11 16 4 4 7-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="action-label">Guard</span></button>
 </div></article>`;
}

export function mountCombatLayout(){
 const main=document.querySelector('main')!,arena=document.querySelector('.arena-shell')!,squad=document.querySelector('#squad')!;
 const view=document.createElement('section');view.className='combat-view';view.setAttribute('aria-label','Battlefield and squad commands');main.prepend(view);view.append(arena,squad);
 const formationControls=document.createElement('div');formationControls.className='formation-controls';
 formationControls.innerHTML=`<button id="reset-formation" class="guard-button">คืนตำแหน่งเดิม</button><button id="start-battle" class="attack-button">เริ่มต่อสู้ →</button>`;
 const arenaControls=document.createElement('div');arenaControls.className='arena-controls';
 arenaControls.append(formationControls,document.querySelector('#speed')!);
 const fullscreen=document.createElement('button');fullscreen.id='fullscreen';fullscreen.className='fullscreen-button';fullscreen.type='button';fullscreen.setAttribute('aria-label','เต็มจอ');fullscreen.setAttribute('aria-pressed','false');fullscreen.title='เต็มจอ';
 fullscreen.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg><span>Full screen</span>`;
 arenaControls.append(fullscreen);document.querySelector('.arena-top')!.append(arenaControls);
 const hud=document.createElement('div');hud.id='hero-huds';arena.append(hud);
 const toolbar=document.querySelector('.command-bar')!;main.insertBefore(toolbar,view.nextSibling);
 const commands=toolbar.querySelector('.commands')!;document.querySelector('.arena-top')!.insertBefore(commands,document.querySelector('.turn'));
 const utility=document.createElement('div');utility.className='combat-utilities';toolbar.append(utility);
 for(const selector of ['#meet-characters','#restart','#sound','#help'])utility.append(document.querySelector(selector)!);
 const progress=document.querySelector('#round-progress')!;main.insertBefore(progress,toolbar.nextSibling);
 const clear=document.querySelector('#round-clear')!;main.insertBefore(clear,toolbar);
}
