import { useEffect, useMemo, useState } from 'react'
import { useAppearance } from '../store/appearance'
import { useSystemStore } from '../store/systemStore'
import { phaseAt, seasonAt } from '../utils/ambience'
import { landscapePhases, sceneSource } from '../wallpapers/manifest'

export default function DynamicWallpaper() {
  const preferences = useAppearance()
  const photo = useSystemStore(state => state.wallpaper)
  const [now, setNow] = useState(() => new Date())
  const [displayed, setDisplayed] = useState('/images/wallpaper.png')
  const [previous, setPrevious] = useState<string | null>(null)
  const phase = preferences.time === 'manual' ? preferences.manualPhase : phaseAt(now.getHours())
  const requested = useMemo(() => sceneSource(preferences.scene, phase, photo, now), [now, phase, photo, preferences.scene])

  useEffect(() => {
    const update = () => setNow(new Date())
    const timer = window.setInterval(update, preferences.scene === 'slideshow' ? 15_000 : 30_000)
    document.addEventListener('visibilitychange', update)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update) }
  }, [preferences.scene])

  useEffect(() => {
    if (requested === displayed) return
    let active = true
    const image = new Image()
    image.onload = () => {
      if (!active) return
      setPrevious(displayed)
      setDisplayed(requested)
      window.setTimeout(() => { if (active) setPrevious(null) }, 2200)
    }
    image.onerror = () => {
      if (active && displayed === '/images/wallpaper.png') setDisplayed(landscapePhases[phase])
    }
    image.src = requested
    return () => { active = false }
  }, [displayed, phase, requested])

  const season = preferences.seasonal ? seasonAt(now.getMonth(), preferences.hemisphere === 'south') : null
  const motion = preferences.motion === 'subtle' && !preferences.lowData && preferences.scene !== 'photo'
  return <div aria-hidden="true" data-phase={phase} data-scene={preferences.scene} className={`ambient-wallpaper phase-${phase}${motion ? ' has-motion' : ''}${season ? ` season-${season}` : ''}`}>
    {previous && <img className="wallpaper-layer wallpaper-previous" src={previous} alt="" />}
    <img key={displayed} className="wallpaper-layer wallpaper-current" src={displayed} alt="" />
    <div className="ambience-tint" />
  </div>
}
