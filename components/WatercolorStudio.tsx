"use client";
import { useEffect,useRef,useState } from "react";
const colors=["#536f8e","#b66c79","#c6a476","#648b7c","#8a7b9b","#c27f55"];
export default function WatercolorStudio(){
 const ref=useRef<HTMLCanvasElement>(null),drawing=useRef(false),last=useRef<{x:number,y:number}|null>(null),history=useRef<ImageData[]>([]);
 const [color,setColor]=useState(colors[0]),[tool,setTool]=useState<"brush"|"water"|"eraser">("brush"),[size,setSize]=useState(22),[revision,setRevision]=useState(0);
 const [panel,setPanel]=useState<"size"|"palette"|"mixer"|null>(null);
 const [customColors,setCustomColors]=useState<string[]>([]);
 const [mixA,setMixA]=useState(colors[0]),[mixB,setMixB]=useState(colors[1]),[mixRatio,setMixRatio]=useState(50);
 const mix=(a:string,b:string,p:number)=>{const v=(n:number)=>Math.round(parseInt(a.slice(n,n+2),16)*(1-p/100)+parseInt(b.slice(n,n+2),16)*p/100).toString(16).padStart(2,"0");return "#"+v(1)+v(3)+v(5)};
 const mixed=mix(mixA,mixB,mixRatio);
 const addColor=(c:string)=>{setCustomColors(v=>v.includes(c)?v:[...v,c]);setColor(c);setTool("brush")};
 const icon=(name:"brush"|"water"|"eraser"|"palette"|"mixer")=>{
 const common={width:19,height:19,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
 if(name==="brush")return <svg {...common}><path d="m14 6 4-4 4 4-4 4M14 6 4 16l4 4 10-10M4 16c-2 1-2 4-2 6 2 0 5 0 6-2"/></svg>;
 if(name==="water")return <svg {...common}><path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M9 17a3 3 0 0 0 3 3"/></svg>;
 if(name==="eraser")return <svg {...common}><path d="m20 14-7 7H6l-4-4a2 2 0 0 1 0-3L13 3a2 2 0 0 1 3 0l6 6a2 2 0 0 1 0 3l-2 2ZM9 9l9 9M13 21h9"/></svg>;
 if(name==="palette")return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-4h2a4 4 0 0 0 4-4c0-3-4-6-9-6Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/></svg>;
 return <svg {...common}><path d="m4 3 4 4m-2-2 12 12M16 3l5 5-4 4-5-5zM3 16l5 5 4-4-5-5z"/><path d="M11 11l2 2"/></svg>;
 };
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;const resize=()=>{const old=document.createElement("canvas");old.width=canvas.width;old.height=canvas.height;old.getContext("2d")?.drawImage(canvas,0,0);const box=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#fbf9f5";ctx.fillRect(0,0,box.width,box.height);if(old.width&&old.height)ctx.drawImage(old,0,0,old.width,old.height,0,0,box.width,box.height)};resize();window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize)},[]);

 // Restored from the approved V8 watercolor study: pigment and water are
 // separate fields. Water deposits no color; it re-wets and transports pigment.
 const fluid=useRef<{w:number;h:number;scale:number;W:number;H:number;wet:Float32Array;vx:Float32Array;vy:Float32Array;pigment:Float32Array[];paper:Float32Array;grain:Float32Array;colors:string[];base:HTMLCanvasElement;raf:number;active:number;frame:number}|null>(null);
 const settings=useRef({tool,color,size});settings.current={tool,color,size};
 const fluidInit=()=>{const canvas=ref.current;if(!canvas)return;const box=canvas.getBoundingClientRect(),w=box.width,h=box.height,scale=Math.min(1,400/Math.max(w,1)),W=Math.max(4,Math.round(w*scale)),H=Math.max(4,Math.round(h*scale)),N=W*H;
 const paper=new Float32Array(N),grain=new Float32Array(N);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;paper[i]=.7+.3*Math.random();grain[i]=(Math.random()-.5)*12}
 const base=document.createElement("canvas");base.width=canvas.width;base.height=canvas.height;base.getContext("2d")?.drawImage(canvas,0,0);
 fluid.current={w,h,scale,W,H,wet:new Float32Array(N),vx:new Float32Array(N),vy:new Float32Array(N),pigment:[new Float32Array(N)],paper,grain,colors:[settings.current.color],base,raf:0,active:0,frame:0};
 };
 const fluidRender=()=>{const f=fluid.current,canvas=ref.current,ctx=canvas?.getContext("2d");if(!f||!canvas||!ctx)return;
 const off=document.createElement("canvas");off.width=f.W;off.height=f.H;const oc=off.getContext("2d");if(!oc)return;const img=oc.createImageData(f.W,f.H);
 for(let i=0;i<f.W*f.H;i++){let r=251+f.grain[i]*.3,g=249+f.grain[i]*.3,b=245+f.grain[i]*.3;
 for(let k=0;k<f.pigment.length;k++){const mass=f.pigment[k][i];if(mass<.00005)continue;const c=f.colors[k],a=1-Math.exp(-mass*1.55),cr=parseInt(c.slice(1,3),16),cg=parseInt(c.slice(3,5),16),cb=parseInt(c.slice(5,7),16);r*=1-a*(1-cr/255);g*=1-a*(1-cg/255);b*=1-a*(1-cb/255)}
 const j=i*4;img.data[j]=r;img.data[j+1]=g;img.data[j+2]=b;img.data[j+3]=255;
 }oc.putImageData(img,0,0);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(f.base,0,0,canvas.width,canvas.height);ctx.globalCompositeOperation="multiply";ctx.drawImage(off,0,0,canvas.width,canvas.height);ctx.restore();
 };
 const fluidTick=()=>{const f=fluid.current;if(!f)return;f.raf=0;const {W,H}=f,N=W*H;const nw=new Float32Array(N),nx=new Float32Array(N),ny=new Float32Array(N),np=f.pigment.map(()=>new Float32Array(N));
 for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const i=y*W+x,wi=f.wet[i];if(wi<.00002)continue;
 const l=i-1,r=i+1,u=i-W,d=i+W,gx=f.wet[l]-f.wet[r],gy=f.wet[u]-f.wet[d];
 const vx=Math.max(-3.5,Math.min(3.5,f.vx[i]*.94+gx*.24+(f.paper[r]-f.paper[l])*wi*.13));
 const vy=Math.max(-3.5,Math.min(3.5,f.vy[i]*.94+gy*.24+(f.paper[d]-f.paper[u])*wi*.13));nx[i]=vx;ny[i]=vy;
 let remain=wi*.992;for(let z=0;z<4;z++){const j=[l,r,u,d][z],diff=Math.max(0,wi-f.wet[j]),drift=[-vx,vx,-vy,vy][z],flow=Math.min(remain*.21,Math.max(0,diff*.09+drift*.037*wi)*(.5+f.paper[j]*.65));nw[j]+=flow;remain-=flow}nw[i]+=remain;
 for(let k=0;k<f.pigment.length;k++){const mass=f.pigment[k][i];if(mass<.00001)continue;if(wi<.015){np[k][i]+=mass;continue}let left=mass;
 for(let z=0;z<4;z++){const j=[l,r,u,d][z],wd=Math.max(0,f.wet[j]-wi*.22),drift=[-f.vx[i],f.vx[i],-f.vy[i],f.vy[i]][z],flow=Math.max(0,wd*.027+drift*.018)*Math.min(1,wi)*(.65+f.paper[j]*.4),transfer=Math.min(left*.19,mass*flow);np[k][j]+=transfer;left-=transfer}np[k][i]+=left}
 }
 // Preserve pigment and moisture at the edge instead of clipping it.
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x>=2&&x<W-2&&y>=2&&y<H-2)continue;const i=y*W+x;nw[i]+=f.wet[i]*.99;for(let k=0;k<np.length;k++)np[k][i]+=f.pigment[k][i]}
 f.wet=nw;f.vx=nx;f.vy=ny;f.pigment=np;f.active--;fluidRender();if(f.active>0)f.raf=requestAnimationFrame(fluidTick);
 };
 const requestFluid=()=>{const f=fluid.current;if(f&&!f.raf)f.raf=requestAnimationFrame(fluidTick)};
 const deposit=(px:number,py:number,dx=0,dy=0,force=1)=>{const f=fluid.current;if(!f)return;const {tool,color,size}=settings.current,x=px*f.scale,y=py*f.scale,R=(tool==="water"?size*1.35:tool==="eraser"?size:size*.65)*f.scale;
 let ci=f.colors.indexOf(color);if(ci<0){ci=f.colors.push(color)-1;f.pigment.push(new Float32Array(f.W*f.H))}
 for(let yy=Math.max(2,Math.floor(y-R*2));yy<=Math.min(f.H-3,Math.ceil(y+R*2));yy++)for(let xx=Math.max(2,Math.floor(x-R*2));xx<=Math.min(f.W-3,Math.ceil(x+R*2));xx++){
 const i=yy*f.W+xx,ax=(xx-x)/Math.max(R,1),ay=(yy-y)/Math.max(R,1),d=Math.hypot(ax,ay);if(d>1.5)continue;const v=Math.exp(-d*d*2.5)*force;
 if(tool==="eraser"){for(const p of f.pigment)p[i]*=(1-.20*v);f.wet[i]*=(1-.2*v)}
 else{f.wet[i]=Math.min(3,f.wet[i]+(tool==="water"?1.6:.95)*v);const out=(tool==="water"?2.6:1.8)*v;f.vx[i]=Math.max(-4,Math.min(4,f.vx[i]+ax*out+dx*.12*v));f.vy[i]=Math.max(-4,Math.min(4,f.vy[i]+ay*out+dy*.12*v));if(tool==="brush")f.pigment[ci][i]=Math.min(3,f.pigment[ci][i]+.19*v*f.paper[i])}
 }f.active=210;requestFluid();
 };
 const point=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const p=point(e),prev=last.current||p,dx=p.x-prev.x,dy=p.y-prev.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/9));for(let j=1;j<=steps;j++){const t=j/steps;deposit(prev.x+dx*t,prev.y+dy*t,dx/steps,dy/steps,.75)}last.current=p};
 const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{const canvas=ref.current,ctx=canvas?.getContext("2d");if(!canvas||!ctx)return;if(!fluid.current)fluidInit();history.current.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.current.length>12)history.current.shift();setRevision(v=>v+1);drawing.current=true;last.current=point(e);canvas.setPointerCapture(e.pointerId);deposit(last.current.x,last.current.y,0,0,1.5)};
 const stop=()=>{drawing.current=false;last.current=null};
 const clear=()=>{const canvas=ref.current,ctx=canvas?.getContext("2d");if(!canvas||!ctx)return;history.current.push(ctx.getImageData(0,0,canvas.width,canvas.height));const f=fluid.current;if(f){if(f.raf)cancelAnimationFrame(f.raf);fluid.current=null}ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#fbf9f5";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();setRevision(v=>v+1)};
 const undo=()=>{const canvas=ref.current,ctx=canvas?.getContext("2d"),prev=history.current.pop();if(canvas&&ctx&&prev){const f=fluid.current;if(f?.raf)cancelAnimationFrame(f.raf);fluid.current=null;ctx.putImageData(prev,0,0);setRevision(v=>v+1)}};

 const surprise=()=>{const canvas=ref.current,ctx=canvas?.getContext("2d");if(!canvas||!ctx)return;const f=fluid.current;if(f?.raf)cancelAnimationFrame(f.raf);fluid.current=null;
 history.current.push(ctx.getImageData(0,0,canvas.width,canvas.height));if(history.current.length>12)history.current.shift();
 const w=canvas.width,h=canvas.height,choice=Math.floor(Math.random()*20),rand=(a:number,b:number)=>a+Math.random()*(b-a);
 const wash=(x:number,y:number,r:number,c:string,alpha=.12)=>{ctx.save();ctx.globalCompositeOperation="multiply";for(let k=0;k<5;k++){const xx=x+rand(-r*.12,r*.12),yy=y+rand(-r*.12,r*.12),rr=r*rand(.7,1.1);const g=ctx.createRadialGradient(xx,yy,0,xx,yy,rr);g.addColorStop(0,c+Math.round(alpha*255).toString(16).padStart(2,"0"));g.addColorStop(.65,c+"0b");g.addColorStop(1,c+"00");ctx.fillStyle=g;ctx.beginPath();ctx.arc(xx,yy,rr,0,Math.PI*2);ctx.fill()}ctx.restore()};
 const line=(pts:[number,number][],c:string,width:number)=>{ctx.save();ctx.strokeStyle=c+"77";ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore()};
 const flower=(x:number,y:number,r:number,c:string,petals:number)=>{for(let j=0;j<petals;j++){const a=j*Math.PI*2/petals;wash(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,r*.52,c,.2)}wash(x,y,r*.22,"#c6a476",.35)};
 const horizon=(y:number,c:string)=>{for(let i=0;i<20;i++)wash(rand(0,w),y+rand(-h*.05,h*.05),rand(w*.07,w*.2),c,.08)};
 const v=choice%5,variant=Math.floor(choice/5);
 if(v===0){ // four floral studies
  for(let i=0;i<3+variant;i++){const x=rand(w*.16,w*.85),y=rand(h*.16,h*.67),r=rand(w*.035,w*.085);line([[x,y+r*.5],[x+rand(-w*.04,w*.04),h*.86]],"#648b7c",Math.max(2,w*.002));flower(x,y,r,colors[(i+variant+1)%colors.length],5+variant);for(let j=0;j<3;j++)wash(x+rand(-r,r),y+r+rand(0,h*.15),r*.35,"#648b7c",.13)}
 }else if(v===1){ // four landscapes
  wash(w*.5,h*.23,w*.24,colors[(variant+2)%colors.length],.1);horizon(h*.58,colors[(variant+3)%colors.length]);horizon(h*.75,colors[(variant+4)%colors.length]);for(let i=0;i<4+variant*2;i++){const x=rand(0,w),y=rand(h*.5,h*.9);wash(x,y,rand(w*.03,w*.13),colors[(i+variant)%colors.length],.16)}
 }else if(v===2){ // four geometric studies
  for(let i=0;i<6+variant*3;i++){const x=rand(w*.1,w*.9),y=rand(h*.12,h*.87),r=rand(w*.025,w*.12);wash(x,y,r,colors[(i+variant)%colors.length],.18);if(i%3===0)line([[x-r,y+r],[x+r,y-r]],colors[(i+2)%colors.length],Math.max(2,w*.003))}
 }else if(v===3){ // four abstract color fields
  for(let i=0;i<9+variant*5;i++){const x=rand(w*.08,w*.92),y=rand(h*.12,h*.88),r=rand(w*.045,w*.18);wash(x,y,r,colors[(i+variant)%colors.length],.14)}
 }else{ // four botanical / organic compositions
  for(let i=0;i<4+variant*2;i++){const x=rand(w*.12,w*.88),y=rand(h*.15,h*.75),r=rand(w*.03,w*.09);line([[x,h*.87],[x,y]],"#648b7c",Math.max(2,w*.002));for(let j=0;j<5;j++){const yy=y+j*r*.55;wash(x+((j%2)?1:-1)*r*.65,yy,r*.55,colors[(i+j+variant)%colors.length],.2)}}
 }
 setRevision(z=>z+1);
 };
 const save=()=>{const a=document.createElement("a");a.download="ivonne-watercolor-study.png";a.href=ref.current?.toDataURL("image/png")||"";a.click()};
 return <section className="hybrid-watercolor" aria-label="Interactive watercolor studio"><div className="hybrid-watercolor-bar"><span>● ● ●</span><span>Watercolor.exe</span><span>↗</span></div><div className="hybrid-watercolor-body"><div className="hybrid-watercolor-tools watercolor-toolbox">
 <button title="Brush · click to adjust size" data-tooltip="Brush · adjust size" aria-label="Brush" aria-pressed={tool==="brush"} onClick={()=>{setTool("brush");setPanel(v=>v==="size"?null:"size")}}>{icon("brush")}</button>
 <button title="Water · rewet and blend pigment" data-tooltip="Water · rewet and blend" aria-label="Water" aria-pressed={tool==="water"} onClick={()=>{setTool("water");setPanel(null)}}>{icon("water")}</button>
 <button title="Eraser · remove pigment" data-tooltip="Eraser · remove pigment" aria-label="Eraser" aria-pressed={tool==="eraser"} onClick={()=>{setTool("eraser");setPanel(null)}}>{icon("eraser")}</button>
 <button title="Color palette · choose saved colors" data-tooltip="Color palette" aria-label="Open color palette" aria-expanded={panel==="palette"} onClick={()=>setPanel(v=>v==="palette"?null:"palette")}>{icon("palette")}</button>
 <button title="Color mixer · blend two colors" data-tooltip="Mix two colors" aria-label="Open color mixer" aria-expanded={panel==="mixer"} onClick={()=>setPanel(v=>v==="mixer"?null:"mixer")}>{icon("mixer")}</button>
 <label className="watercolor-active-color" data-tooltip="Choose custom color" title="Choose custom color" style={{background:color}}><input type="color" aria-label="Choose custom watercolor color" value={color} onChange={e=>{setColor(e.target.value);setTool("brush")}} /></label>
 {panel==="size"&&<div className="watercolor-tool-panel watercolor-size-panel"><label htmlFor="watercolor-brush-size">Brush size · {size}</label><input id="watercolor-brush-size" aria-label="Brush size" type="range" min="5" max="65" value={size} onChange={e=>setSize(Number(e.target.value))}/></div>}
 {panel==="palette"&&<div className="watercolor-tool-panel watercolor-palette-panel"><strong>Palette</strong><div className="watercolor-swatch-grid">{[...colors,...customColors].map(c=><button key={c} aria-label={"Paint color "+c} aria-pressed={color===c} onClick={()=>{setColor(c);setTool("brush")}} style={{background:c}}/>)}</div><label>Custom color <input type="color" value={color} onChange={e=>setColor(e.target.value)}/></label><button className="watercolor-panel-action" onClick={()=>addColor(color)}>Add to palette +</button></div>}
 {panel==="mixer"&&<div className="watercolor-tool-panel watercolor-mixer-panel"><strong>Mix colors</strong><div className="watercolor-mix-inputs"><label>Color 1<input aria-label="First mixing color" type="color" value={mixA} onChange={e=>setMixA(e.target.value)}/></label><label>Color 2<input aria-label="Second mixing color" type="color" value={mixB} onChange={e=>setMixB(e.target.value)}/></label></div><label>Mix ratio · {mixRatio}%<input type="range" min="0" max="100" value={mixRatio} onChange={e=>setMixRatio(Number(e.target.value))}/></label><div className="watercolor-mix-preview" style={{background:mixed}}/><button className="watercolor-panel-action" onClick={()=>{addColor(mixed);setPanel("palette")}}>Use + save color</button></div>}
 </div><div className="hybrid-watercolor-paper"><canvas ref={ref} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} aria-label="Watercolor painting canvas"/></div></div><div className="hybrid-watercolor-actions"><div><button disabled={revision===0} onClick={undo}>undo ↶</button><button onClick={surprise}>surprise me ✳</button><button onClick={clear}>clear canvas ×</button><button onClick={save}>save painting ↓</button></div></div></section>
}