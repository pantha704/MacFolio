import { navIcons } from '#constants'
import { useEffect, useRef, useState } from 'react'
import { useWindowStore } from '#store/useWindowStore'
import WifiMenu from './menus/WifiMenu'
import UserMenu from './menus/UserMenu'
import Spotlight from './menus/Spotlight'

const Navbar = () => {
  const [time, setTime] = useState(() => new Date())
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const openWindow = useWindowStore((state) => state.openWindow)

  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 20_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setActiveMenu((menu) => menu === 'search' ? null : 'search')
      } else if (event.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    if (activeMenu && activeMenu !== 'search') {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenu])

  const toggleMenu = (event: React.MouseEvent, menu: string) => {
    event.stopPropagation()
    setActiveMenu((current) => current === menu ? null : menu)
  }

  const labels: Record<number, string> = {
    1: 'Wi-Fi',
    2: 'Spotlight Search',
    3: 'User menu',
  }

  return (
    <nav className="relative z-[9999]" aria-label="macOS menu bar">
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-1.5 py-0.5 hover:bg-white/10"
        onClick={() => openWindow('finder', { activeSide: 'about' })}
        aria-label="Open About Pratham"
      >
        <img src="/images/logo.svg" alt="" className="pb-1 w-5 h-5" />
        <span className="text-sm font-bold tracking-wide hidden sm:block">MacFolio</span>
      </button>

      <div className="flex items-center gap-2 sm:gap-4">
        <ul className="flex items-center gap-1 sm:gap-2">
          {navIcons.map(({ id, img }) => (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={(event) => {
                  if (id === 1) toggleMenu(event, 'wifi')
                  if (id === 2) toggleMenu(event, 'search')
                  if (id === 3) toggleMenu(event, 'user')
                }}
                className={`p-1.5 rounded-md transition-colors ${(
                  (activeMenu === 'wifi' && id === 1) ||
                  (activeMenu === 'user' && id === 3)
                ) ? 'bg-white/15' : 'hover:bg-white/10'}`}
                aria-label={labels[id] ?? 'Menu item'}
                title={id === 2 ? 'Spotlight (⌘/Ctrl K)' : labels[id]}
              >
                <img src={img} alt="" className="w-4 h-4 brightness-0 invert" />
              </button>

              {activeMenu === 'wifi' && id === 1 && (
                <div ref={menuRef} onClick={(event) => event.stopPropagation()}>
                  <WifiMenu />
                </div>
              )}
              {activeMenu === 'user' && id === 3 && (
                <div ref={menuRef} onClick={(event) => event.stopPropagation()}>
                  <UserMenu />
                </div>
              )}
            </li>
          ))}
        </ul>

        <time
          dateTime={time.toISOString()}
          className="text-xs sm:text-sm font-medium min-w-[66px] sm:min-w-[140px] text-right"
          title={new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(time)}
        >
          <span className="hidden sm:inline">
            {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(time)}
          </span>
          <span className="sm:hidden">
            {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(time)}
          </span>
        </time>
      </div>

      {activeMenu === 'search' && <Spotlight onClose={() => setActiveMenu(null)} />}
    </nav>
  )
}

export default Navbar
