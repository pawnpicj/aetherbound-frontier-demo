import {heroDesigns,poseUrl} from './characters';
import {chapterSteps,loadChapter,saveChapter,summonFirstCompanion} from './chapter';
import './chapter.css';

export function mountChapter(canOpen:()=>boolean){
 let state=loadChapter(),step=state.step,busy=false;
 const dialog=document.createElement('dialog');dialog.id='chapter-dialog';dialog.className='chapter-dialog';dialog.setAttribute('aria-labelledby','chapter-scene-title');
 document.body.append(dialog);
 const openButton=document.createElement('button');openButton.id='story-open';openButton.className='quiet-button';openButton.textContent='◇ เนื้อเรื่อง';openButton.title='จุดเริ่มต้นของอัศวิน';document.querySelector('.combat-utilities')!.prepend(openButton);
 const portraits={lyra:'อัศวินแห่งสายน้ำ',orin:'อัศวินผู้พิทักษ์พงไพร',ren:'อัศวินสายฟ้า',mira:'อัศวินแห่งแสง'};
 const greetings={lyra:'หากเจ้าตั้งใจปกป้องผู้คน ข้าจะร่วมทางไปกับเจ้า',orin:'ยืนอยู่ข้างหลังข้าเถอะ จากนี้เจ้าจะไม่ต้องรับทุกอย่างเพียงลำพัง',ren:'อย่ามัวเสียใจที่พ่ายแพ้ ลุกขึ้นเถอะ เรายังมีทางต้องเดินอีกไกล',mira:'เจ้ากลับมามีชีวิตแล้ว จงใช้โอกาสนี้พาแสงสว่างกลับไปให้ผู้คน'};
 function render(){
  const current=chapterSteps[step],companion=heroDesigns.find(h=>h.id===state.companion);
  const isResult=step===8&&companion;
  const actor=isResult?companion:heroDesigns[0];
  const pose=step===2?4:step===3||step===4?5:step===1?1:0;
  dialog.dataset.scene=current.scene;
  dialog.innerHTML=`<img class="chapter-background" src="/assets/story/${current.art}.webp" alt="${current.art==='forest'?'ทางเดินในป่าและหัวหน้าก็อบลิน':current.art==='river'?'หน้าผาสูงเหนือแม่น้ำเชี่ยว':'ศาลเจ้าริมน้ำ วิญญาณเทพ และแท่งอัญเชิญ'}"><div class="chapter-shade"></div>
  <header class="chapter-header"><div><span>บทที่ 01 · AETHERBOUND</span><h1>จุดเริ่มต้นของอัศวิน</h1></div><button id="chapter-skip">${step===8?'ไปสนาม →':state.completed?'กลับสนาม ×':'ข้ามไปศาลเจ้า →'}</button></header>
  <div class="chapter-stage" aria-hidden="true"><div class="chapter-portal"></div><div class="chapter-motes">${Array.from({length:12},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><img class="chapter-actor" src="${poseUrl(actor,pose)}" alt="">${step<=2?`<div class="chapter-duel"><span>KAEL <b>Lv. 1</b></span><i style="--hp:${step===2?'6':'100'}%"></i><small>${step===2?'พ่ายแพ้ · บาดเจ็บหนัก':'นักสู้ฝึกหัด'}</small></div>`:''}${isResult?`<div class="chapter-reveal"><span>อัศวินผู้ตอบรับ</span><strong>${companion.name}</strong><small>${portraits[state.companion!]}</small></div>`:''}</div>
  <section class="chapter-caption"><div class="chapter-text"><span class="chapter-speaker">${isResult?companion.name.toUpperCase():current.speaker}</span><h2 id="chapter-scene-title">${isResult?`${companion.name} ตอบรับคำอัญเชิญ`:current.title}</h2><p>${isResult?`${portraits[state.companion!]} ก้าวออกมาจากแสงของแท่งอัญเชิญ จากนี้ Kael จะไม่ต้องเดินทางเพียงลำพังอีกต่อไป`:current.body}</p><blockquote>${isResult?`“${greetings[state.companion!]}”`:current.quote}</blockquote>${isResult?'<p class="chapter-crystals"><i></i> อัญเชิญครั้งต่อไป: คริสตัลสีม่วงดำ 100 ชิ้น <span>มอนสเตอร์ 10–20% · 1 ชิ้น / บอส 100% · 3–5 ชิ้น</span></p>':''}</div>
  <div class="chapter-navigation"><div class="chapter-progress" aria-label="ฉาก ${step+1} จาก 9">${chapterSteps.map((_,i)=>`<i class="${i===step?'current':i<step?'past':''}"></i>`).join('')}<span>${String(step+1).padStart(2,'0')} / 09</span></div><div><button id="chapter-back" ${step===0||step>=7?'disabled':''} aria-label="ฉากก่อนหน้า">←</button><button id="chapter-next">${step===7&&state.companion?'ดูอัศวินที่ตอบรับ':current.action}</button></div></div></section>`;
  dialog.querySelector<HTMLButtonElement>('#chapter-next')!.onclick=()=>void advance();
  dialog.querySelector<HTMLButtonElement>('#chapter-back')!.onclick=()=>{if(!busy&&step>0&&step<7){step--;persist();render()}};
  dialog.querySelector<HTMLButtonElement>('#chapter-skip')!.onclick=()=>{if(busy)return;if(step===8)void advance();else if(state.completed)close();else{step=6;persist();render()}};
  dialog.querySelector<HTMLButtonElement>('#chapter-next')!.focus({preventScroll:true});
 }
 function persist(){state={...state,step};saveChapter(state)}
 function close(){dialog.close();openButton.focus({preventScroll:true})}
 async function advance(){
  if(busy)return;
  if(step===8){state={...state,step:8,completed:true};saveChapter(state);close();return}
  if(step===7){
   if(!state.companion){
    const value=crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
    state=summonFirstCompanion(state,value);saveChapter(state);
    busy=true;dialog.classList.add('is-summoning');const button=dialog.querySelector<HTMLButtonElement>('#chapter-next')!;button.disabled=true;button.textContent='กำลังเรียกหาอัศวิน…';
    await new Promise(resolve=>setTimeout(resolve,1200));dialog.classList.remove('is-summoning');busy=false;
   }
   step=8;
  }else step++;
  persist();render();
 }
 function open(replay=false){if(!canOpen()||busy)return;step=replay?0:state.step;render();dialog.showModal()}
 dialog.addEventListener('cancel',e=>{if(!state.completed||busy)e.preventDefault()});
 openButton.onclick=()=>open(true);
 if(!state.completed)open();
}
