// Select a pose's alpha components when neighboring drawings touch an atlas cell.
// Keep the principal figure and substantial detached props inside the cell.
export function extractPoseComponents(data,width,height){
 const count=width*height,labels=new Int32Array(count),queue=new Uint32Array(count),components=[];
 let label=0;
 for(let start=0;start<count;start++){
  if(labels[start]||data[start*4+3]<=20)continue;
  label++;let head=0,tail=1;queue[0]=start;labels[start]=label;
  const component={id:label,area:0,minX:width,minY:height,maxX:0,maxY:0};
  while(head<tail){
   const pixel=queue[head++],x=pixel%width,y=Math.floor(pixel/width);component.area++;
   component.minX=Math.min(component.minX,x);component.maxX=Math.max(component.maxX,x);component.minY=Math.min(component.minY,y);component.maxY=Math.max(component.maxY,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;
    const next=ny*width+nx;if(labels[next]||data[next*4+3]<=20)continue;labels[next]=label;queue[tail++]=next;
   }
  }
  components.push(component);
 }
 const principal=components.reduce((a,b)=>b.area>(a?.area??0)?b:a,null);
 if(!principal)throw Error('Pose is empty');
 const keep=new Set(components.filter(c=>c.id===principal.id||(c.area>=128&&c.minX>16&&c.maxX<width-16&&c.minY>8&&c.maxY<height-32)).map(c=>c.id));
 for(let pixel=0;pixel<count;pixel++){
  if(keep.has(labels[pixel]))continue;
  let edge=false;
  if(data[pixel*4+3]<=20){
   const x=pixel%width,y=Math.floor(pixel/width);
   for(let dy=-2;dy<=2&&!edge;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<width&&ny<height&&keep.has(labels[ny*width+nx])){edge=true;break}}
  }
  if(!edge)data[pixel*4+3]=0;
 }
 return data;
}
