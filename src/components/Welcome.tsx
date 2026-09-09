import { FolderOpen, Image, Terminal, Settings, Gamepad2, Mail } from 'lucide-react'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'
import { profile } from '../data/portfolio'
const shortcuts = [ ['finder', 'My work', FolderOpen], ['photos', 'Photos', Image], ['terminal', 'Terminal', Terminal], ['settings', 'Settings', Settings], ['arcade', 'Arcade', Gamepad2], ['contact', 'Contact', Mail] ] as const
export default function Welcome() {
  const open = useWindowStore(s => s.openWindow)
  return <section className="native-desktop" id="portfolio" aria-label="Desktop">
    <div className="desktop-greeting"><span>WELCOME TO MY LITTLE CORNER</span><h1>{profile.firstName}’s<em>desktop.</em></h1><p>Builder, explorer, occasional high-score chaser.</p><button onClick={() => open('finder')}>Explore my work ↗</button></div>
    <nav className="desktop-shortcuts" aria-label="Desktop apps">{shortcuts.map(([key, name, Icon]) => <button key={key} onClick={() => open(key as WindowKey)}><span className={`desktop-app-icon icon-${key}`}><Icon size={30}/></span><span>{name}</span></button>)}</nav>
    <div className="desktop-hint">⌘ / Ctrl K to search · Alt W to close</div>
  </section>
}
