import React, { useRef, useState } from 'react'
import { useWindowStore, WindowKey } from '#store/useWindowStore'
import { useGSAP } from '@gsap/react'
import { Draggable } from 'gsap/Draggable'
import gsap from 'gsap'

const WindowWrapper = (Component: React.ComponentType<Record<string, unknown>>, windowKey: WindowKey) => {
  const Wrapped = (props: Record<string, unknown>) => {
    // Performance optimization: Select only necessary state
    const isOpen = useWindowStore(state => state.windows[windowKey].isOpen)
    const zIndex = useWindowStore(state => state.windows[windowKey].zIndex)
    const focusWindow = useWindowStore(state => state.focusWindow)

    const ref = useRef<HTMLDivElement>(null)
    const [isRendered, setIsRendered] = useState(isOpen)

    // Handle mounting/unmounting for animations
    useGSAP(() => {
      if (isOpen) {
        setIsRendered(true)
      }
    }, [isOpen])

    useGSAP(() => {
      const el = ref.current
      if (!el || !isRendered) return

      if (isOpen) {
        // Enter animation
        el.style.display = 'block'
        gsap.fromTo(el,
          { scale: 0.8, opacity: 0, y: 40 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        )
      } else {
        // Exit animation
        gsap.to(el, {
          scale: 0.8,
          opacity: 0,
          y: 40,
          duration: 0.3,
          ease: 'power3.in',
          onComplete: () => {
            setIsRendered(false)
          }
        })
      }
    }, [isOpen, isRendered])

    useGSAP(() => {
      const el = ref.current
      if (!el) return

      // Use .window-header as trigger if it exists, otherwise fallback to element itself
      const header = el.querySelector('.window-header')

      const [instance] = Draggable.create(el, {
        trigger: header || el,
        onPress: () => focusWindow(windowKey),
        allowEventDefault: true, // Allow interaction with child elements
        dragClickables: false, // Prevent dragging when clicking interactive elements
      })

      return () => instance.kill()
    }, [isRendered]) // Re-create draggable when rendered state changes

    if (!isRendered) return null

    return (
      <section
        id={windowKey}
        ref={ref}
        className='absolute window resize overflow-hidden min-w-[300px] min-h-[200px]'
        style={{ zIndex, display: 'block' }} // Ensure display is block when rendered
      >
        <div className="w-full h-full">
          <Component {...props} />
        </div>
      </section>
    )
  }

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || 'Component'})`

  return Wrapped
}

export default WindowWrapper
