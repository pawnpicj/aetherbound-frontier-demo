export const companionIds=['lyra','orin','ren','mira'] as const;
export type CompanionId=typeof companionIds[number];
export interface ChapterSave {version:1;step:number;companion:CompanionId|null;completed:boolean}
const key='aetherbound.chapter-one.v1';
export const newChapter=():ChapterSave=>({version:1,step:0,companion:null,completed:false});
export function loadChapter(storage?:Pick<Storage,'getItem'>):ChapterSave{
 try{
  const value=JSON.parse((storage??globalThis.localStorage).getItem(key)??'null');
  if(value?.version===1&&Number.isInteger(value.step)&&value.step>=0&&value.step<=8&&typeof value.completed==='boolean'&&(value.companion===null||companionIds.includes(value.companion))&&(!(value.completed||value.step===8)||value.companion!==null))return {version:1,step:value.step,companion:value.companion,completed:value.completed};
 }catch{/* Story remains available when browser storage cannot be read. */}
 return newChapter();
}
export function saveChapter(state:ChapterSave,storage?:Pick<Storage,'setItem'>){try{(storage??globalThis.localStorage).setItem(key,JSON.stringify(state))}catch{/* Continue this session when storage is unavailable. */}}
export function summonFirstCompanion(state:ChapterSave,random:number):ChapterSave{
 if(state.companion)return {...state,step:8};
 const roll=Number.isFinite(random)?Math.max(0,Math.min(.999999999,random)):0;
 return {...state,step:8,companion:companionIds[Math.floor(roll*companionIds.length)]};
}

export const chapterSteps=[
 {scene:'road',art:'forest',speaker:'KAEL · นักสู้ Lv.1',title:'เส้นทางสู่เมืองหลวง',body:'หลังหมู่บ้านถูกปีศาจทำลาย Kael ออกเดินทางพร้อมดาบเก่า เขาตั้งใจจะสมัครเข้ากองอัศวิน แล้วกลับมาปกป้องผู้คนที่ยังเหลืออยู่',quote:'“ข้าจะกลับมา… ในวันที่แข็งแกร่งพอจะปกป้องทุกคน”',action:'เดินทางต่อ →'},
 {scene:'goblin',art:'forest',speaker:'หัวหน้าก็อบลิน',title:'ผู้ขวางเส้นทาง',body:'เสียงกิ่งไม้หักดังมาจากทางข้างหน้า หัวหน้าก็อบลินในเกราะเหล็กก้าวออกมาขวาง ขวานใหญ่ของมันครูดพื้นหิน Kael กำดาบแน่นและยกขึ้นตั้งรับ',quote:'“ถอยไป! ข้าไม่มีเวลามาติดอยู่ที่นี่”',action:'ยกดาบต่อสู้'},
 {scene:'defeat',art:'forest',speaker:'KAEL · บาดเจ็บหนัก',title:'ดาบที่ยังอ่อนแอ',body:'คมดาบสะท้อนออกจากเกราะของก็อบลิน ขวานของมันเหวี่ยงสวนจน Kael ล้มลง เขาฝืนลุกขึ้นอีกครั้ง แต่แขนแทบไม่มีแรงยกดาบแล้ว',quote:'“สู้ต่อไม่ได้… ข้าต้องหนี!”',action:'ถอยหนี →'},
 {scene:'fall',art:'river',speaker:'ริมหน้าผาชายแดน',title:'ทางหนีที่สิ้นสุด',body:'ก็อบลินไล่ต้อนเขาจนถึงริมผา Kael เบี่ยงตัวหลบขวาน แต่พื้นหินใต้เท้ากลับแตกออก ร่างของเขาร่วงลงสู่แม่น้ำเชี่ยวเบื้องล่าง',quote:'เสียงน้ำกลบทุกสิ่ง… แล้วโลกก็มืดลง',action:'ตามกระแสน้ำไป'},
 {scene:'shore',art:'shrine',speaker:'ศาลเจ้าเก่าริมแม่น้ำ',title:'เมื่อหัวใจหยุดเต้น',body:'กระแสน้ำพาร่างของ Kael มาติดอยู่บนขั้นบันไดศาลเจ้าที่ถูกลืม เขาไม่หายใจแล้ว เหนือแท่นบูชาที่แตกร้าว แสงอ่อน ๆ เริ่มรวมตัวเป็นวิญญาณเทพ',quote:'“ดวงจิตเอ๋ย… เจ้ายังได้ยินข้าหรือไม่”',action:'ฟังเสียงจากศาลเจ้า'},
 {scene:'deity',art:'shrine',speaker:'วิญญาณเทพผู้เฝ้าศาลเจ้า',title:'เสียงเรียกในความมืด',body:'“ข้าคืนชีวิตให้เจ้าได้ แต่เจ้าต้องรับพันธสัญญา จงตามหาต้นกำเนิดของรอยแยก และหยุดปีศาจที่หลั่งไหลเข้ามา”',quote:'Kael นึกถึงคนในหมู่บ้าน… “ข้ายังปกป้องพวกเขาไม่ได้เลย”',action:'ตอบรับเสียงนั้น'},
 {scene:'pact',art:'shrine',speaker:'KAEL · ผู้รับพันธสัญญา',title:'ชีวิตที่ได้รับคืน',body:'“ถ้ามันทำให้ข้าปกป้องทุกคนได้… ข้ารับคำ” ตราพันธสัญญาปรากฏบนมือ หัวใจของ Kael กลับมาเต้นอีกครั้ง เขาสำลักน้ำและลืมตาขึ้น ท่ามกลางเศษหินที่ลอยมาประกอบเป็นแท่งอัญเชิญ',quote:'“เส้นทางข้างหน้าเกินกำลังเจ้าเพียงคนเดียว ข้ามอบสิทธิ์อัญเชิญอัศวินให้เจ้าหนึ่งครั้ง”',action:'รับพันธสัญญา →'},
 {scene:'summon',art:'shrine',speaker:'แท่งอัญเชิญ',title:'ใครจะตอบรับคำเรียก',body:'Kael วางมือลงบนแท่งอัญเชิญ แสงจากคริสตัลสีม่วงดำไหลไปตามอักขระ อัศวินหนึ่งคนจะตอบรับแบบสุ่ม โดยไม่ใช้คริสตัลสำหรับครั้งแรก',quote:'“ข้ามิอาจกำหนดผู้ตอบรับได้ เจ้าต้องเรียกหาเขาด้วยตนเอง”',action:'อัญเชิญฟรี 1 ครั้ง'},
 {scene:'result',art:'shrine',speaker:'พันธสัญญาแรก',title:'พวกพ้องคนแรก',body:'',quote:'',action:'ออกเดินทางด้วยกัน →'},
] as const;
