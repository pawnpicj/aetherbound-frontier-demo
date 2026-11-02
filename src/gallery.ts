import {characters,poseUrl} from './characters';
import {heroArt,bossArt} from './art';
import './gallery.css';
export const galleryMarkup=`<dialog id="character-dialog" aria-labelledby="character-heading"><button class="close-dialog" id="close-character" aria-label="Close character gallery">×</button><nav class="character-tabs" aria-label="Choose a character">${characters.map(c=>`<button data-character="${c.id}" aria-pressed="false"><span style="--accent:${c.color}"></span>${c.name}</button>`).join('')}</nav><div class="character-showcase"><div class="character-art-stage"><div class="character-orbit"></div><span class="character-art-title" aria-hidden="true"></span><img id="character-image" alt=""><span id="character-pose-label"></span></div><div class="character-info"><span class="eyebrow" id="character-subtitle"></span><h2 id="character-heading"></h2><p class="character-quote"></p><p class="character-description"></p><div class="character-palette"></div><div class="character-compare" aria-label="Compare character designs"><button data-design="new" aria-pressed="true">New design</button><button data-design="original" aria-pressed="false">Original</button></div><div class="character-poses" aria-label="Preview character poses"></div><button class="attack-button" id="try-character">Back to battle →</button></div></div></dialog>`;
export function mountGallery(onOpen:()=>void){
 let selected=characters[0],pose=0,original=false;
 const dialog=document.querySelector<HTMLDialogElement>('#character-dialog')!;
 const q=<T extends HTMLElement=HTMLElement>(s:string)=>dialog.querySelector<T>(s)!;
 const originalColors=['#f59765','#6fc4f2','#8acb9c','#c7adfa','#f3d788'];
 const originalImage=()=> 'data:image/svg+xml;base64,'+btoa(selected.heroIndex<0?bossArt:heroArt(originalColors[selected.heroIndex],selected.heroIndex));
 function update(){
  dialog.style.setProperty('--character',selected.color);
  const image=q<HTMLImageElement>('#character-image');const source=original?originalImage():poseUrl(selected,pose);image.style.opacity='0';image.src=source;void image.decode().then(()=>{if(image.getAttribute('src')===source)image.style.opacity='1'}).catch(()=>{image.style.opacity='1'});image.alt=`${original?'Original':'Redesigned'} ${selected.name} — ${selected.poses[pose]}`;image.classList.toggle('original-art',original);
  q('.character-art-title').textContent=selected.id==='hollowguard'?'ANCIENT':selected.element;
  q('#character-pose-label').textContent=original?'ORIGINAL / FIRST EXPEDITION':`0${pose+1} / ${selected.poses[pose].toUpperCase()}`;
  q('#character-heading').textContent=selected.name;q('#character-subtitle').textContent=selected.title+' · '+selected.element;
  q('.character-quote').textContent='“'+selected.quote+'”';q('.character-description').textContent=selected.description;
  q('.character-palette').innerHTML=selected.palette.map(color=>`<i style="--swatch:${color}"></i>`).join('')+'<span>'+selected.element+'</span>';
  dialog.querySelectorAll<HTMLButtonElement>('[data-character]').forEach(b=>{const active=b.dataset.character===selected.id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
  dialog.querySelectorAll<HTMLButtonElement>('[data-design]').forEach(b=>{const active=(b.dataset.design==='original')===original;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
  q('.character-poses').innerHTML=selected.poses.map((name,i)=>`<button data-pose="${i}" class="${i===pose&&!original?'selected':''}" aria-pressed="${i===pose&&!original}" ${original?'disabled':''}><span>0${i+1}</span>${name}</button>`).join('');
  dialog.querySelectorAll<HTMLButtonElement>('[data-pose]').forEach(b=>b.onclick=()=>{pose=Number(b.dataset.pose);update()});
 }
 dialog.querySelectorAll<HTMLButtonElement>('[data-character]').forEach(b=>b.onclick=()=>{selected=characters.find(c=>c.id===b.dataset.character)!;pose=0;original=false;update()});
 dialog.querySelectorAll<HTMLButtonElement>('[data-design]').forEach(b=>b.onclick=()=>{original=b.dataset.design==='original';update()});
 q('#close-character').onclick=()=>dialog.close();q('#try-character').onclick=()=>dialog.close();
 return (id='kael')=>{onOpen();selected=characters.find(c=>c.id===id)??characters[0];pose=0;original=false;update();dialog.showModal();dialog.scrollTop=0;const tab=dialog.querySelector<HTMLButtonElement>(`[data-character="${selected.id}"]`)!;tab.scrollIntoView({block:'nearest',inline:'nearest'});};
}
