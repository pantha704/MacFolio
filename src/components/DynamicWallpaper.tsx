import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useAppearance } from '../store/appearance'
import { useSystemStore } from '../store/systemStore'
import { phaseAt, seasonAt } from '../utils/ambience'
import { landscapePhases, sceneSource } from '../wallpapers/manifest'
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
  const fallback = landscapePhases[phase]
  const [layers, setLayers] = useState({ current: fallback, previous: '' })
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false)
  const onReady = useCallback(() => setReady(true), []),
    onFailure = useCallback(() => setFailed(true), [])
  useEffect(() => {
    let active = true
    const image = new Image()
    const commit = (source: string) => {
      if (active)
        setLayers((old) =>
          old.current === source
            ? old
            : { current: source, previous: old.current },
        )
    }
    image.onload = () => commit(requested)
    image.onerror = () => commit(fallback)
    image.src = requested
    return () => {
      active = false
      image.onload = null
      image.onerror = null
    }
  }, [requested, fallback])
  useEffect(() => {
    if (!layers.previous) return
    const timer = setTimeout(
      () => setLayers((old) => ({ ...old, previous: '' })),
      1800,
    )
    return () => clearTimeout(timer)
  }, [layers.previous])
  const living = preferences.scene === 'living' && !failed
  const season =
    preferences.seasonMode === 'auto'
      ? seasonAt(now.getMonth(), preferences.hemisphere === 'south')
      : preferences.seasonMode
  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      data-scene={preferences.scene}
      data-flipped={preferences.flipHorizontal}
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
              season: preferences.seasonal ? season : null,
              particles: preferences.atmosphere ? season : null,
              flipHorizontal: preferences.flipHorizontal,
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
