import { useEffect, useRef, useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { useWindowStore } from '#store/useWindowStore'
import { safeStorage } from '../utils/storage'
type Game = 'pong' | 'pinball' | 'racer'
const Arcade = () => {
 const [game,setGame]=useState<Game>('pinball'),[running,setRunning]=useState(false),[score,setScore]=useState(0),[best,setBest]=useState(0)
 const canvas=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>())
 const active=useWindowStore(s => !s.windows.arcade.isMinimized && s.windows.arcade.zIndex === s.nextZIndex-1)
 useEffect(()=>{setRunning(false);setScore(0); const n=Number(safeStorage.getItem('arcade-'+game));setBest(Number.isFinite(n)?Math.max(0,n):0)},[game])
 useEffect(()=>{if(!active)setRunning(false)},[active])
 useEffect(()=>{const hide=()=>{if(document.hidden)setRunning(false)}; document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[])
 useEffect(()=>{
  const c=canvas.current,ctx=c?.getContext('2d'); if(!c||!ctx)return
  let x=240,y=300,vx=150,vy=-200,paddle=240,enemy=240,t=0,points=0,frame=0,last=0,obstacle=90,obstacleY=-80
  keys.current.clear()
  const save=()=>{setBest(b=>{const n=Math.max(b,points);safeStorage.setItem('arcade-'+game,String(n));return n})}
  const add=(n:number)=>{points+=n;setScore(points);save()}
  const end=()=>{setRunning(false);save()}
  const rect=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
  const circle=(x:number,y:number,r:number,color:string)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  const draw=(stamp:number)=>{
   const dt=last?Math.min((stamp-last)/1000,.025):0;last=stamp;t+=dt
   rect(0,0,480,480,'#0c1225');ctx.strokeStyle='#33405c';ctx.strokeRect(12,12,456,456)
   const left=keys.current.has('ArrowLeft')||keys.current.has('a'),right=keys.current.has('ArrowRight')||keys.current.has('d')
   if(running){paddle=Math.max(55,Math.min(425,paddle+(Number(right)-Number(left))*330*dt));}
   if(game==='pong'){
    for(let i=20;i<480;i+=24)rect(238,i,3,10,'#26344c')
    if(running){x+=vx*dt;y+=vy*dt;enemy+=Math.sign(x-enemy)*Math.min(Math.abs(x-enemy),160*dt);if(x<20||x>460){vx*=-1;x=Math.max(20,Math.min(460,x))} if(vy>0&&y>=426&&y<449&&Math.abs(x-paddle)<58){vy=-Math.abs(vy)*1.035;vx=(x-paddle)*5;add(10)} if(vy<0&&y<=54&&y>28&&Math.abs(x-enemy)<58)vy=Math.abs(vy); if(y<10){add(50);x=240;y=240;vy=210}if(y>480)end()}
    rect(paddle-50,438,100,9,'#a8ffd5');rect(enemy-50,34,100,9,'#ff98c7');circle(x,y,8,'#fff')
   }else if(game==='pinball'){
    if(running){vy+=300*dt;x+=vx*dt;y+=vy*dt;if(x<24||x>456){vx*=-1;x=Math.max(24,Math.min(456,x))}if(y<25){vy=Math.abs(vy);y=25}}
    for(const [bx,by] of [[150,140],[330,140],[240,235]]){circle(bx,by,30,'#713d7a');circle(bx,by,22,'#ffa5dd');const dx=x-bx,dy=y-by,d=Math.hypot(dx,dy);if(running&&d<39&&d>0){x=bx+dx/d*40;y=by+dy/d*40;vx=dx/d*310;vy=dy/d*310;add(25)}}
    rect(26,368,105,12,'#70cbe5');rect(349,368,105,12,'#70cbe5')
    if(running&&vy>0&&y>357&&y<382&&(x<140||x>340)){vy=-Math.abs(vy)*.85;vx=x<240?140:-140}
    const flipper=(cx:number,on:boolean,side:number)=>{ctx.strokeStyle=on?'#fff6a4':'#78e6c1';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,432);ctx.lineTo(cx+side*82,on?405:453);ctx.stroke();if(running&&vy>0&&y>393&&y<457&&x>Math.min(cx,cx+side*82)-8&&x<Math.max(cx,cx+side*82)+8&&on){vy=-440;vx=side*130; y=390;add(5)}}
    flipper(125,left,1);flipper(355,right,-1);circle(x,y,8,'#fff');if(running&&y>490)end()
   }else{
    rect(70,0,340,480,'#263046');for(let i=-1;i<8;i++){rect(180,(i*80+t*180)%560-40,5,35,'#bcc7d6');rect(300,(i*80+t*180)%560-40,5,35,'#bcc7d6')}
    paddle=Math.max(95,Math.min(385,paddle));if(running){obstacleY+=(180+points*2)*dt;if(obstacleY>510){obstacleY=-80;obstacle=100+Math.random()*280;add(10)}if(Math.abs(paddle-obstacle)<36&&Math.abs(410-obstacleY)<48)end()}
    rect(obstacle-18,obstacleY-30,36,60,'#ff8fbb');rect(paddle-12,380,24,60,'#78e6c1');circle(paddle,390,9,'#eafffa')
   }
   if(!running){ctx.fillStyle='#ffffff';ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('Press Start to play',240,300)}
   if(running)frame=requestAnimationFrame(draw)
  }
  frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);keys.current.clear()}
 },[game,running])
 const key=(k:string,down:boolean)=>{if(down)keys.current.add(k);else keys.current.delete(k)}
 return <div className="arcade-app"><header className="window-header"><WindowControls target="arcade"/><span>After Hours Arcade</span></header><div className="arcade-toolbar">{(['pinball','pong','racer'] as const).map(g=><button key={g} aria-pressed={game===g} onClick={()=>setGame(g)}>{g==='racer'?'Midnight Ride':g==='pong'?'Paddle Club':'Pocket Pinball'}</button>)}<span>Score {score} · Best {best}</span></div><div className="arcade-stage" tabIndex={0} aria-label="Game controls: left and right arrows, A and D" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','a','d'].includes(e.key)){e.preventDefault();key(e.key,true)}}} onKeyUp={e=>key(e.key,false)} onBlur={()=>{keys.current.clear();setRunning(false)}}><canvas ref={canvas} width={480} height={480} aria-label={game+' game field'}/></div><div className="arcade-controls"><button onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);key('ArrowLeft',true)}} onPointerUp={()=>key('ArrowLeft',false)} onLostPointerCapture={()=>key('ArrowLeft',false)}>◀ Left</button><button onClick={e=>{setRunning(r=>!r);if(!running)setScore(0);(e.currentTarget.closest('.arcade-app')?.querySelector('.arcade-stage') as HTMLElement)?.focus()}}>{running?'Stop':'Start'}</button><button onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);key('ArrowRight',true)}} onPointerUp={()=>key('ArrowRight',false)} onLostPointerCapture={()=>key('ArrowRight',false)}>Right ▶</button></div><p className="arcade-caption">{game==='pinball'?'Hold left / right to lift the flippers. Keep the ball alive.':game==='pong'?'Move left / right. Return the ball to score.':'Steer left / right. Dodge traffic to score.'} Original mini-games. Play stops when you leave the window; Start begins a new run.</p></div>
}
export default WindowWrapper(Arcade,'arcade')
