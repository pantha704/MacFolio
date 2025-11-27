import dayjs from "dayjs"
import { navIcons } from "#constants"
import { useEffect, useState, useRef } from "react"
import WifiMenu from "./menus/WifiMenu"
import ControlCenter from "./menus/ControlCenter"
import UserMenu from "./menus/UserMenu"
import Spotlight from "./menus/Spotlight"

const Navbar = () => {
    const [time, setTime] = useState(dayjs())
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(dayjs())
      }, 1000 * 20)

      return () => clearInterval(interval)
    }, [])

    // Handle click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Don't close if clicking the toggle buttons themselves (handled by stopPropagation in button or logic here)
                // Actually, simpler: if we click outside the menu container, close it.
                // But the buttons are outside the menu container.
                // Let's rely on the fact that clicking a button toggles it.
                // We need to be careful not to close immediately when opening.
                setActiveMenu(null)
            }
        }

        if (activeMenu && activeMenu !== 'search') { // Search has its own overlay
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [activeMenu])

    const toggleMenu = (e: React.MouseEvent, menu: string) => {
        e.stopPropagation() // Prevent click from bubbling to document
        setActiveMenu(prev => prev === menu ? null : menu)
    }

    return (
        <nav className="relative z-[9999]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <img src="/images/logo.svg" alt="logo" className="pb-1 w-5 h-5"/>
                <p className="text-sm font-bold tracking-wide">Pratham&apos;s Portfolio</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-4">
              {navIcons.map(({id, img}) => (
                <li key={id} className="relative">
                  <button
                    onClick={(e) => {
                        if (id === 1) toggleMenu(e, 'wifi')
                        if (id === 2) toggleMenu(e, 'search')
                        if (id === 3) toggleMenu(e, 'user')
                        if (id === 4) toggleMenu(e, 'control')
                    }}
                    className={`p-1 rounded-md transition-colors ${
                        (activeMenu === 'wifi' && id === 1) ||
                        (activeMenu === 'control' && id === 4) ||
                        (activeMenu === 'user' && id === 3)
                        ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    <img src={img} alt="nav-icon" className="w-4 h-4" />
                  </button>

                  {/* Render Menus anchored to their buttons */}
                  {activeMenu === 'wifi' && id === 1 && (
                      <div ref={menuRef} onClick={e => e.stopPropagation()}>
                          <WifiMenu />
                      </div>
                  )}
                  {activeMenu === 'user' && id === 3 && (
                      <div ref={menuRef} onClick={e => e.stopPropagation()}>
                          <UserMenu />
                      </div>
                  )}
                  {activeMenu === 'control' && id === 4 && (
                      <div ref={menuRef} onClick={e => e.stopPropagation()}>
                          <ControlCenter />
                      </div>
                  )}
                </li>
              ))}
            </ul>

            <time dateTime="2025" className="text-sm font-medium min-w-[140px] text-right">
                {time.format("ddd MMM D h:mm A")}
            </time>
          </div>

          {/* Spotlight is global overlay */}
          {activeMenu === 'search' && (
              <Spotlight onClose={() => setActiveMenu(null)} />
          )}
        </nav>
    )
}

export default Navbar