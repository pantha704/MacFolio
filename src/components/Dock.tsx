import { dockApps } from '../desktop/appRegistry'
import { useWindowStore } from '#store/useWindowStore'

const Dock = () => {
  const windows = useWindowStore(state => state.windows)
  const launch = useWindowStore(state => state.launchFromDock)
  return <section id="dock" aria-label="Application dock"><div className="dock-container">{dockApps.map(({ id, name, icon, desktopIcon: Icon }) => <div key={id} className="relative flex flex-col items-center gap-1"><button type="button" className={`dock-icon${icon ? '' : ` dock-symbol icon-${id}`}`} aria-label={name} aria-pressed={windows[id].isOpen && !windows[id].isMinimized} onClick={() => launch(id)}><span className="dock-label">{name}</span>{icon ? <img src={`/images/${icon}`} alt="" width={48} height={48} /> : Icon ? <Icon size={28}/> : null}</button><span aria-hidden="true" className={`size-1 rounded-full bg-white/80 ${windows[id].isOpen ? 'opacity-100' : 'opacity-0'}`} /></div>)}</div></section>
}
export default Dock
