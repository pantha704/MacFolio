import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { useAppearance } from '../store/appearance'
import { wallpaperScenes } from '../wallpapers/manifest'
import { useLocalClock } from '../hooks/useLocalClock'
import { phaseAt, type Phase } from '../utils/ambience'
import type { SeasonMode } from '../wallpapers/atmosphere'
const phases: Phase[] = ['dawn', 'day', 'evening', 'night']
function Settings() {
  const prefs = useAppearance(),
    now = useLocalClock(),
    set = prefs.update
  const hour =
    prefs.time === 'manual'
      ? prefs.manualHour
      : now.getHours() + now.getMinutes() / 60
  const minutes = Math.round(hour * 60) % 1440
  const clock = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return (
    <div className="settings-app">
      <header className="window-header">
        <WindowControls target="settings" />
        <span>Desktop & appearance</span>
      </header>
      <div className="settings-content">
        <div className="settings-heading">
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h2>A change of scenery.</h2>
          <p>A quiet landscape, at your pace.</p>
        </div>
        <section
          className="settings-section"
          aria-labelledby="wallpaper-scenes"
        >
          <h3 id="wallpaper-scenes">Your backdrop</h3>
          <div className="scene-options">
            {wallpaperScenes
              .filter((s) => s.id !== 'landscape')
              .map((scene) => (
                <button
                  key={scene.id}
                  aria-pressed={prefs.scene === scene.id}
                  onClick={() => set({ scene: scene.id })}
                >
                  <span
                    className={`scene-swatch scene-${scene.id}`}
                    style={{ backgroundImage: `url(${scene.phases.day})` }}
                  />
                  <strong>{scene.name}</strong>
                  <small>{scene.description}</small>
                </button>
              ))}
          </div>
        </section>
        <section
          className="settings-section time-section"
          aria-labelledby="wallpaper-time"
        >
          <div className="time-title">
            <div>
              <h3 id="wallpaper-time">Light & time</h3>
              <p>
                {prefs.time === 'auto'
                  ? Intl.DateTimeFormat().resolvedOptions().timeZone
                  : 'Your chosen mood'}
              </p>
            </div>
            <output>{clock}</output>
          </div>
          <div className="settings-segment">
            <button
              aria-pressed={prefs.time === 'auto'}
              onClick={() => set({ time: 'auto', scene: 'living' })}
            >
              Follow my local time
            </button>
            <button
              aria-pressed={prefs.time === 'manual'}
              onClick={() => set({ time: 'manual', scene: 'living' })}
            >
              Set the mood
            </button>
          </div>
          {prefs.time === 'manual' && (
            <>
              <input
                className="time-slider"
                type="range"
                min={0}
                max={1439}
                value={Math.round(prefs.manualHour * 60)}
                aria-label="Preview time of day"
                onChange={(e) =>
                  set({
                    manualHour: Number(e.target.value) / 60,
                    scene: 'living',
                  })
                }
              />
              <div className="phase-options">
                {phases.map((phase) => (
                  <button
                    key={phase}
                    aria-pressed={phaseAt(hour) === phase}
                    onClick={() => set({ manualPhase: phase, scene: 'living' })}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="setting-note">
            Artistic lighting follows your device clock. It does not estimate
            sunrise or request your location.
          </p>
        </section>
        <section className="settings-section settings-toggles">
          <h3>Motion & seasons</h3>
          <label>
            <span>
              <strong>Mirror the landscape</strong>
              <small>Swap the left and right of your backdrop.</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.flipHorizontal}
              onChange={(e) => set({ flipHorizontal: e.target.checked })}
            />
          </label>
          <label>
            <span>
              <strong>Living scenery</strong>
              <small>
                Water, starlight and drifting seasons. Respects reduced motion.
              </small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.motion === 'subtle'}
              onChange={(e) =>
                set({ motion: e.target.checked ? 'subtle' : 'still' })
              }
            />
          </label>
          <label>
            <span>
              <strong>Low power</strong>
              <small>Lower resolution, with no continuous movement.</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.lowData}
              onChange={(e) => set({ lowData: e.target.checked })}
            />
          </label>
          <label>
            <span>
              <strong>Seasonal atmosphere</strong>
              <small>
                Daytime blossoms, summer motes, oak leaves or soft snow.
              </small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.atmosphere}
              onChange={(e) => set({ atmosphere: e.target.checked })}
            />
          </label>
          {(prefs.atmosphere || prefs.seasonal) && (
            <label>
              <span>
                <strong>Season</strong>
                <small id="season-help">
                  Follow the calendar, or choose a favourite.
                </small>
              </span>
              <select
                aria-label="Season"
                aria-describedby="season-help"
                value={prefs.seasonMode}
                onChange={(e) =>
                  set({ seasonMode: e.target.value as SeasonMode })
                }
              >
                <option value="auto">Current season</option>
                <option value="spring">Spring · cherry blossoms</option>
                <option value="summer">Summer · golden light</option>
                <option value="autumn">Autumn · oak leaves</option>
                <option value="winter">Winter · snowfall</option>
              </select>
            </label>
          )}
          <label>
            <span>
              <strong>Seasonal palette</strong>
              <small>Subtle calendar-based colour changes.</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={prefs.seasonal}
              onChange={(e) => set({ seasonal: e.target.checked })}
            />
          </label>
          {(prefs.seasonal || prefs.atmosphere) &&
            prefs.seasonMode === 'auto' && (
              <label>
                <span>Hemisphere</span>
                <select
                  value={prefs.hemisphere}
                  onChange={(e) =>
                    set({ hemisphere: e.target.value as 'north' | 'south' })
                  }
                >
                  <option value="north">Northern</option>
                  <option value="south">Southern</option>
                </select>
              </label>
            )}
        </section>
        <button className="settings-reset" onClick={prefs.reset}>
          Restore defaults
        </button>
      </div>
    </div>
  )
}
export default WindowWrapper(Settings, 'settings')
