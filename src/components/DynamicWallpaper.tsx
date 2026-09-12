import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useAppearance } from '../store/appearance'
import { useSystemStore } from '../store/systemStore'
import { phaseAt, seasonAt } from '../utils/ambience'
import { sceneSource } from '../wallpapers/manifest'
import { useLocalClock } from '../hooks/useLocalClock'
import { useWindowStore } from '../store/useWindowStore'
const LivingScene = lazy(() =>
  import('../wallpapers/LivingScene').catch(() => ({ default: () => <></> })),
)
export default function DynamicWallpaper() {
  const preferences = useAppearance(),
    photo = useSystemStore((s) => s.wallpaper),
    now = useLocalClock()
  const playing = useWindowStore(
    (s) => s.focusedWindow === 'arcade' && !s.windows.arcade.isMinimized,
  )
  const phase = phaseAt(
    preferences.time === 'manual' ? preferences.manualHour : now.getHours(),
  )
  const requested = sceneSource(preferences.scene, phase, photo, now)
  const [layers, setLayers] = useState({ current: requested, previous: '' })
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false)
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), [])
  useEffect(() => {
    let active = true
    const image = new Image()
    image.onload = () => {
      if (active)
        setLayers((old) =>
          old.current === requested
            ? old
            : { current: requested, previous: old.current },
        )
    }
    image.src = requested
    return () => {
      active = false
    }
  }, [requested])
  useEffect(() => {
    if (!layers.previous) return
    const timer = setTimeout(
      () => setLayers((old) => ({ ...old, previous: '' })),
      1800,
    )
    return () => clearTimeout(timer)
  }, [layers.previous])
  const living = preferences.scene === 'living' && !failed
  const season = preferences.seasonal
    ? seasonAt(now.getMonth(), preferences.hemisphere === 'south')
    : null
  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      data-scene={preferences.scene}
      className={`ambient-wallpaper studio-wallpaper phase-${phase}${living && ready ? ' is-live' : ''}`}
    >
      {layers.previous && (
        <img
          className="wallpaper-layer wallpaper-previous"
          src={layers.previous}
          alt=""
        />
      )}
      <img
        key={layers.current}
        className="wallpaper-layer wallpaper-current"
        src={layers.current}
        alt=""
      />
      {living && (
        <Suspense fallback={null}>
          <LivingScene
            options={{
              hour:
                preferences.time === 'manual' ? preferences.manualHour : null,
              motion: preferences.motion === 'subtle',
              lowData: preferences.lowData || playing,
              season,
            }}
            onReady={onReady}
            onFailure={onFailure}
          />
        </Suspense>
      )}
      <div className="desktop-scrim" />
    </div>
  )
}
