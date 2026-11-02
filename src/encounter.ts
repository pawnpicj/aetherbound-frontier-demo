export const battlefield={width:1200,height:600};
export const heroFormation=[
 {x:115,y:300,size:137},
 {x:280,y:370,size:131},
 {x:115,y:440,size:145},
 {x:115,y:580,size:135},
 {x:280,y:510,size:129},
];
const mixedFormation=[
 {id:'bramble-1',x:725,y:300,size:125},
 {id:'wisp-1',x:560,y:370,size:117},
 {id:'bramble-2',x:725,y:440,size:125},
 {id:'wisp-2',x:560,y:510,size:117},
 {id:'bramble-3',x:725,y:580,size:125},
 {id:'boss',x:1035,y:440,size:280},
];
export const encounters=[
 {id:'monsters',name:'Forest ambush',label:'รอบมอนสเตอร์',description:'มอนสเตอร์ 5 ตัว',formation:mixedFormation.filter(p=>p.id!=='boss').map(p=>({...p,x:p.x+300}))},
 {id:'boss',name:'The ancient guardian',label:'รอบบอส',description:'เผชิญบอสเดี่ยว',formation:[{id:'boss',x:900,y:500,size:340}]},
 {id:'mixed',name:'The final stand',label:'รอบผสม',description:'มอนสเตอร์คุ้มกันบอสด้านหลังตรงกลาง',formation:mixedFormation},
];
export const monsterArt={
 bramble:{atlas:'/assets/monsters/bramble/atlas-v6.webp',color:'#b4d18a'},
 wisp:{atlas:'/assets/monsters/wisp/atlas-v6.webp',color:'#c59bea'},
};
