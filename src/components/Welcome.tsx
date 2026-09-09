import { useWindowStore } from '#store/useWindowStore'
import { desktopApps } from '../desktop/appRegistry'
import { profile } from '../data/portfolio'
export default function Welcome() {
  const open = useWindowStore(s => s.openWindow)
  return <section className="native-desktop" id="portfolio" aria-label="Desktop">
    <div className="desktop-greeting"><span>WELCOME TO MY LITTLE CORNER</span><h1>{profile.firstName}’s<em>desktop.</em></h1><p>Builder, explorer, occasional high-score chaser.</p><button onClick={() => open('finder')}>Explore my work ↗</button></div>
    <nav className="desktop-shortcuts" aria-label="Desktop apps">{desktopApps.map(({ id, name, desktopIcon: Icon }) => <button key={id} onClick={() => open(id)}><span className={`desktop-app-icon icon-${id}`}>{Icon ? <Icon size={30}/> : null}</span><span>{id === 'finder' ? 'My work' : name}</span></button>)}</nav>
    <div className="desktop-hint">⌘ / Ctrl K to search · Alt W to close</div>
  </section>
}
