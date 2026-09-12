import { useEffect, useState } from 'react'
import { Search, Wifi, WifiOff, Monitor, SlidersHorizontal } from 'lucide-react'
import { useWindowStore } from '#store/useWindowStore'
import Spotlight from './menus/Spotlight'
import { useLocalClock } from '../hooks/useLocalClock'
export default function Navbar() {
  const time = useLocalClock(),
    [searchOpen, setSearchOpen] = useState(false),
    [online, setOnline] = useState(navigator.onLine)
  const openWindow = useWindowStore((s) => s.openWindow),
    toggleShowDesktop = useWindowStore((s) => s.toggleShowDesktop)
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine)
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('online', connection)
    window.addEventListener('offline', connection)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('online', connection)
      window.removeEventListener('offline', connection)
    }
  }, [])
  return (
    <>
      <nav className="menubar" aria-label="Desktop menu">
        <div className="menu-left">
          <button
            className="brand-button"
            onClick={toggleShowDesktop}
            aria-label="Show or restore desktop"
          >
            <Monitor size={17} />
            <strong>MacFolio</strong>
          </button>
          <button
            className="menu-link"
            onClick={() => openWindow('finder', { activeSide: 'work' })}
          >
            Work
          </button>
          <button
            className="menu-link"
            onClick={() => openWindow('finder', { activeSide: 'about' })}
          >
            About
          </button>
          <button className="menu-link" onClick={() => openWindow('resume')}>
            Résumé
          </button>
        </div>
        <div className="menu-right">
          <button
            className="menu-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search portfolio (Control or Command K)"
          >
            <Search size={15} />
            <span>Search</span>
            <kbd>⌘ K</kbd>
          </button>
          <span
            className="connection-status"
            title={online ? 'Device is online' : 'Device is offline'}
          >
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
          </span>
          <button
            aria-label="Desktop appearance"
            onClick={() => openWindow('settings')}
          >
            <SlidersHorizontal size={16} />
          </button>
          <time
            dateTime={time.toISOString()}
            title={Intl.DateTimeFormat().resolvedOptions().timeZone}
          >
            {time.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
            <span>
              {' '}
              {time.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </time>
        </div>
      </nav>
      {searchOpen && <Spotlight onClose={() => setSearchOpen(false)} />}
    </>
  )
}
