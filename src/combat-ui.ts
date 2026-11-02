import type {Hero} from './battle';
import {icons} from './art';
import {heroDesigns} from './characters';
import {battlefield,heroFormation} from './encounter';

export function fieldHud(h:Hero,i:number){
 const p=heroFormation[i],top=p.y-p.size*.72-32;
 return `<div class="field-hero-hud ${h.hp<=0?'fallen':''}" data-hud="${h.id}" style="left:${(p.x-68)/1200*100}%;top:${top/battlefield.height*100}%;--hero:${h.color}" role="group" aria-label="${h.name}: HP ${h.hp} / ${h.maxHp}, BB ${h.bb}%"><div class="field-hp-line"><span>HP</span><b>${h.hp.toLocaleString()}<small> / ${h.maxHp.toLocaleString()}</small></b></div><div class="field-hp-track"><i style="width:${h.hp/h.maxHp*100}%"></i></div><div class="field-bb-line"><span>BB</span><div><i style="width:${h.bb}%"></i></div><b>${h.bb===100?'READY':h.bb+'%'}</b></div></div>`;
}

export function heroCard(h:Hero,i:number,attackEnabled:boolean,burstEnabled:boolean){
 const ready=h.bb===100&&h.hp>0&&!h.acted;
 const state=h.hp<=0?'Fallen':h.acted?'Done':'Attack';
 const support=h.role==='Shield'?' · Reduces enemy damage by 50%':h.role==='Heal'?' · Heals living allies for 650 HP':' · Splash damage to other enemies';
 return `<article class="hero-card ${h.acted?'acted':''} ${h.hp<=0?'fallen':''}" style="--hero:${h.color}" aria-label="${h.name}, ${h.role}"><div class="hero-portrait"><span class="element" title="${h.element}">${icons[h.element]}</span><img src="${heroDesigns[i].portrait}" alt="${h.name}, ${h.title.toLowerCase()}"><span class="hero-level">LV. 10</span><button class="view-character" data-view-character="${h.id}" aria-label="Explore ${h.name} character design">VIEW DESIGN ↗</button><div class="hero-actions"><button class="attack-action" data-attack="${i}" aria-label="${h.name} Attack" title="${h.name} · Attack (${i+1})" ${attackEnabled?'':'disabled'}><span class="action-glyph attack-glyph" aria-hidden="true"></span><span class="action-label">${state}</span><kbd>${i+1}</kbd></button><button data-burst="${i}" class="burst ${ready?'ready':''}" aria-label="${h.name} Brave Burst: ${h.skill}" title="${h.skill}${support} · ${h.bb===100?'BB READY':'Charge '+h.bb+'%'}" ${burstEnabled?'':'disabled'}><span class="action-glyph burst-glyph" aria-hidden="true"></span><span class="action-label">BB</span><span class="bb-charge">${h.bb===100?'READY':h.bb+'%'}</span></button></div></div><div class="hero-info"><div class="hero-name">${h.name}<small>${h.hp<=0?'Fallen':h.acted?'Action complete':h.role}</small></div></div></article>`;
}

export function mountCombatLayout(){
 const main=document.querySelector('main')!,arena=document.querySelector('.arena-shell')!,squad=document.querySelector('#squad')!;
 const view=document.createElement('section');view.className='combat-view';view.setAttribute('aria-label','Battlefield and squad commands');main.prepend(view);view.append(arena,squad);
 const hud=document.createElement('div');hud.id='hero-huds';arena.append(hud);
 const toolbar=document.querySelector('.command-bar')!;main.insertBefore(toolbar,view.nextSibling);
 const commands=toolbar.querySelector('.commands')!;document.querySelector('.arena-top')!.insertBefore(commands,document.querySelector('.turn'));
 const utility=document.createElement('div');utility.className='combat-utilities';toolbar.append(utility);
 for(const selector of ['#meet-characters','#restart','#sound','#help'])utility.append(document.querySelector(selector)!);
 const progress=document.querySelector('#round-progress')!;main.insertBefore(progress,toolbar.nextSibling);
 const clear=document.querySelector('#round-clear')!;main.insertBefore(clear,toolbar);
}
