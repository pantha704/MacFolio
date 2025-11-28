import { useRef } from 'react'
import { dockApps } from '#constants'
import { Tooltip } from 'react-tooltip'
import { useGSAP } from '@gsap/react'
import { useWindowStore } from '#store/useWindowStore'
import gsap from 'gsap'

const Dock = () => {
  const dockRef = useRef<HTMLDivElement>(null)
  const { windows, openWindow } = useWindowStore()

  useGSAP(() => {
    const dock = dockRef.current
    if (!dock) return () => {}

    const icons = dock.querySelectorAll(".dock-icon")

    const animateIcons = (mouseX: number) => {
      const { left } = dock.getBoundingClientRect()
      icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect()
        const center = iconLeft - left + width / 2
        const distance = Math.abs(mouseX - center)
        const intensity = Math.exp(-(distance ** 2) / 10000)
        const scale = 1 + 0.25 * intensity

        gsap.to(icon, {
          duration: 0.2,
          y: -15 * intensity,
          ease: "power1.out",
          scale,
          transformOrigin: "center center",
        })
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { left } = dock.getBoundingClientRect();

      animateIcons(e.clientX - left)
    }

    const resetIcons = () =>
      icons.forEach((icon) =>
        gsap.to(icon, {
          duration: 0.3,
          y: 0,
          ease: "power1.out",
          scale: 1,
          transformOrigin: "center center",
        })
      )

    dock.addEventListener("mousemove", handleMouseMove)
    dock.addEventListener("mouseleave", resetIcons)

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove)
      dock.removeEventListener("mouseleave", resetIcons)
    }
  }, [])

  const toggleApp = (app: {id: string, canOpen: boolean}) => {
    if (!app.canOpen) return

    if (app.id === 'trash') {
        openWindow('finder', { activeSide: 'trash' })
        return
    }

    const { windows: currentWindows } = useWindowStore.getState() // Get fresh state directly
    if (!(app.id in currentWindows)) return

    const win = currentWindows[app.id as keyof typeof currentWindows]

    // If closed, open it
    if (!win.isOpen) {
        openWindow(app.id as keyof typeof currentWindows)
        return
    }

    // If minimized, restore it
    if (win.isMinimized) {
        useWindowStore.getState().restoreWindow(app.id as keyof typeof currentWindows)
        return
    }

    // If open and active (topmost), minimize it
    // We need a way to check if it's the topmost window.
    // For now, we can check if it has the highest zIndex among open windows.
    const openWindows = Object.values(currentWindows).filter(w => w.isOpen && !w.isMinimized)
    const maxZ = Math.max(...openWindows.map(w => w.zIndex), 0)

    if (win.zIndex === maxZ) {
        useWindowStore.getState().minimizeWindow(app.id as keyof typeof currentWindows)
    } else {
        // If open but not active, focus it
        useWindowStore.getState().focusWindow(app.id as keyof typeof currentWindows)
    }
  }

  return (
    <section id="dock">
      <div ref={dockRef} className='dock-container scale-75 sm:scale-100 origin-bottom mb-2 sm:mb-0'>
        {dockApps.map(({id, name, icon, canOpen}) => (
          <div key={id} className='relative flex justify-center items-center flex-col gap-1'>
            <button
              type='button'
              className='dock-icon'
              aria-label={name}
              data-tooltip-id="dock-tooltip"
              data-tooltip-content={name}
              data-tooltip-delay-show={150}
              disabled={!canOpen}
              onClick={() => toggleApp({id, canOpen})}
            >
              <img src={'/images/' + icon} alt={name} loading='lazy' className={canOpen ? "" : "opacity-50"}/>
            </button>
            <div className={`size-1 rounded-full bg-white/50 ${windows[id as keyof typeof windows]?.isOpen ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        ))}
      </div>
      <Tooltip id="dock-tooltip" />
    </section>
  )
}

export default Dock
