import { useEffect, useState } from 'react'
import { Search, Wifi, WifiOff, Monitor } from 'lucide-react'
import { useWindowStore } from '#store/useWindowStore'
import { useSystemStore } from '#store/systemStore'
import Spotlight from './menus/Spotlight'

const Navbar = () => {
  const [time, setTime] = useState(() => new Date())
  const [searchOpen, setSearchOpen] = useState(false)
  const isWifiEnabled = useSystemStore(state => state.isWifiEnabled)
  const toggleWifi = useSystemStore(state => state.toggleWifi)
  const openWindow = useWindowStore(state => state.openWindow)
  const toggleShowDesktop = useWindowStore(state => state.toggleShowDesktop)
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 30_000)
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(open => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { clearInterval(timer); window.removeEventListener('keydown', onKey) }
  }, [])
  return (
    <>
      <nav className="menubar" aria-label="Desktop menu">
        <div className="menu-left">
          <button className="brand-button" onClick={toggleShowDesktop} aria-label="Show or restore desktop"><Monitor size={18} /><strong>MacFolio</strong></button>
          <button className="menu-link" onClick={() => openWindow('finder', { activeSide: 'work' })}>Work</button>
          <button className="menu-link" onClick={() => openWindow('finder', { activeSide: 'about' })}>About</button>
          <button className="menu-link" onClick={() => openWindow('resume')}>Résumé</button>
        </div>
        <div className="menu-right">
          <button className="menu-search" onClick={() => setSearchOpen(true)} aria-label="Search portfolio (Control or Command K)"><Search size={16} /><span>Search</span><kbd>⌘ K</kbd></button>
          <button className="menu-wifi" onClick={toggleWifi} aria-label={isWifiEnabled ? 'Turn simulated Wi-Fi off' : 'Turn simulated Wi-Fi on'} title="Simulated Wi-Fi: your device connection is unchanged">{isWifiEnabled ? <Wifi size={16} /> : <WifiOff size={16} />}</button>
          <time dateTime={time.toISOString()}>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}<span> {time.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span></time>
        </div>
      </nav>
      {searchOpen && <Spotlight onClose={() => setSearchOpen(false)} />}
    </>
  )
}
export default Navbar
