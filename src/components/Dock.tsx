import { dockApps } from '#constants'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'

const Dock = () => {
  const windows = useWindowStore(state => state.windows)
  const launch = (id: string) => {
    const state = useWindowStore.getState()
    if (id === 'trash') { state.openWindow('finder', { activeSide: 'trash' }); return }
    const key = id as WindowKey, item = state.windows[key]
    if (!item) return
    if (!item.isOpen) state.openWindow(key)
    else if (item.isMinimized) state.restoreWindow(key)
    else if (item.zIndex === Math.max(...Object.values(state.windows).filter(win => win.isOpen && !win.isMinimized).map(win => win.zIndex))) state.minimizeWindow(key)
    else state.focusWindow(key)
  }
  return <section id="dock" aria-label="Application dock"><div className="dock-container">{dockApps.map(({ id, name, icon }) => <div key={id} className="relative flex flex-col items-center gap-1"><button type="button" className="dock-icon" aria-label={name} aria-pressed={Boolean(windows[id as WindowKey]?.isOpen && !windows[id as WindowKey]?.isMinimized)} onClick={() => launch(id)}><span className="dock-label">{name}</span><img src={`/images/${icon}`} alt="" width={48} height={48} /></button><span aria-hidden="true" className={`size-1 rounded-full bg-white/80 ${windows[id as WindowKey]?.isOpen ? 'opacity-100' : 'opacity-0'}`} /></div>)}</div></section>
}
export default Dock
