import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { useAppearance, type AppearancePreferences } from '../store/appearance'
import { wallpaperScenes } from '../wallpapers/manifest'
import type { Phase } from '../utils/ambience'

const phaseNames: Record<Phase, string> = { dawn: 'Dawn', day: 'Day', evening: 'Evening', night: 'Night' }
const phases = Object.keys(phaseNames) as Phase[]

const Settings = () => {
  const preferences = useAppearance()
  const set = (value: Partial<AppearancePreferences>) => preferences.update(value)
  return <div className="settings-app"><header className="window-header"><WindowControls target="settings"/><span>Desktop & appearance</span></header><div className="settings-content">
    <div className="settings-heading"><span className="eyebrow">APPEARANCE</span><h2>A desktop that follows your day.</h2><p>Local-time scenery works without location access.</p></div>
    <section className="settings-section" aria-labelledby="wallpaper-scenes"><h3 id="wallpaper-scenes">Scene</h3><div className="scene-options">{wallpaperScenes.map(scene => <button key={scene.id} aria-pressed={preferences.scene === scene.id} onClick={() => set({ scene: scene.id })}><span className={`scene-swatch scene-${scene.id}`} /><strong>{scene.name}</strong><small>{scene.description}</small></button>)}</div></section>
    <section className="settings-section" aria-labelledby="wallpaper-time"><h3 id="wallpaper-time">Time</h3><div className="settings-segment"><button aria-pressed={preferences.time === 'auto'} onClick={() => set({ time: 'auto' })}>Use local time</button><button aria-pressed={preferences.time === 'manual'} onClick={() => set({ time: 'manual' })}>Choose a phase</button></div>{preferences.time === 'manual' && <div className="phase-options">{phases.map(phase => <button key={phase} className={`phase-${phase}`} aria-pressed={preferences.manualPhase === phase} onClick={() => set({ manualPhase: phase })}>{phaseNames[phase]}</button>)}</div>}</section>
    <section className="settings-section settings-toggles" aria-labelledby="wallpaper-comfort"><h3 id="wallpaper-comfort">Comfort & data</h3><label><input type="checkbox" checked={preferences.motion === 'subtle'} onChange={event => set({ motion: event.target.checked ? 'subtle' : 'still' })}/><span><strong>Subtle landscape motion</strong><small>Reduced-motion settings always keep it still.</small></span></label><label><input type="checkbox" checked={preferences.seasonal} onChange={event => set({ seasonal: event.target.checked })}/><span><strong>Seasonal colour</strong><small>Uses calendar seasons and your hemisphere.</small></span></label><label><input type="checkbox" checked={preferences.lowData} onChange={event => set({ lowData: event.target.checked })}/><span><strong>Low-data mode</strong><small>Turns off continuous wallpaper movement.</small></span></label><label><span><strong>Hemisphere</strong><small>Used only for the seasonal treatment.</small></span><select value={preferences.hemisphere} onChange={event => set({ hemisphere: event.target.value as 'north' | 'south' })}><option value="north">Northern</option><option value="south">Southern</option></select></label></section>
    <button className="settings-reset" onClick={preferences.reset}>Restore appearance defaults</button>
  </div></div>
}
export default WindowWrapper(Settings, 'settings')
