import { useEffect, useState } from 'react'
import { useAppearance } from '../store/appearance'
import { useSystemStore } from '../store/systemStore'
import { phaseAt, seasonAt } from '../utils/ambience'
export default function DynamicWallpaper() {
 const p = useAppearance(), photo = useSystemStore(s => s.wallpaper)
 const [now, setNow] = useState(() => new Date())
 useEffect(() => { const update = () => setNow(new Date()); const timer = setInterval(update, 30000); document.addEventListener('visibilitychange', update); return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update) } }, [])
 const phase = p.mode === 'auto' || p.mode === 'photo' ? phaseAt(now.getHours()) : p.mode === 'rotate' ? ['dawn','day','evening','night'][Math.floor(now.getTime() / 300000) % 4] : p.mode
 return <div aria-hidden="true" className={`ambient-wallpaper phase-${phase} ${p.motion ? 'has-motion' : ''} ${p.seasonal ? `season-${seasonAt(now.getMonth(), p.south)}` : ''}`}>
 <img src={p.mode === 'photo' ? photo : '/images/wallpaper.png'} alt="" onError={e => { if (!e.currentTarget.src.endsWith('/images/wallpaper.png')) e.currentTarget.src = '/images/wallpaper.png' }} />
 <div className="ambience-tint"/>
 </div>
}
