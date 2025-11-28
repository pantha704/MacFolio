import React, { useRef, useState } from 'react'
import { useWindowStore, WindowKey } from '#store/useWindowStore'
import { useGSAP } from '@gsap/react'
import { Draggable } from 'gsap/Draggable'
import gsap from 'gsap'

const WindowWrapper = (Component: React.ComponentType<Record<string, unknown>>, windowKey: WindowKey) => {
  const Wrapped = (props: Record<string, unknown>) => {
    // Performance optimization: Select only necessary state
    const isOpen = useWindowStore(state => state.windows[windowKey].isOpen)
    const isMinimized = useWindowStore(state => state.windows[windowKey].isMinimized)
    const isMaximized = useWindowStore(state => state.windows[windowKey].isMaximized)
    const zIndex = useWindowStore(state => state.windows[windowKey].zIndex)
    const data = useWindowStore(state => state.windows[windowKey].data)
    const focusWindow = useWindowStore(state => state.focusWindow)

    const ref = useRef<HTMLDivElement>(null)
    const [isRendered, setIsRendered] = useState(isOpen)
    const [isInteracting, setIsInteracting] = useState(false)

    // Handle mounting/unmounting for animations
    useGSAP(() => {
      if (isOpen && !isMinimized) {
        setIsRendered(true)
      }
    }, [isOpen, isMinimized])

    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useGSAP(() => {
      const el = ref.current
      if (!el || !isRendered) return

      if (isOpen && !isMinimized) {
        // Enter animation or State Update
        el.style.display = 'block'
        gsap.set(el, { pointerEvents: 'auto' })

        if (isMaximized) {
            // Maximize Animation
            gsap.to(el, {
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                x: 0,
                y: 0,
                borderRadius: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            })
        } else {
            // Normal State (or Restore from Maximize)
            // We need to be careful not to override Draggable position if we are just opening/restoring
            // But if we are restoring from Maximize, we might want to revert to previous size.
            // Since we don't store previous size, we'll revert to default CSS or specific dimensions.
            // For now, let's just ensure we are not forced to full screen.

            // If we are transitioning FROM maximized, we should animate back.
            // But we don't know previous state here easily without a ref.
            // Let's just animate to a "default" or "restored" state if it was maximized.

            // Actually, if we just remove the inline styles set by maximize, it might work?
            // But GSAP sets inline styles.

            // Let's try to animate to a safe default if we are not maximized.
            // But only if we are not just opening.

            if (isMobile) {
                gsap.to(el, {
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    borderRadius: 0,
                    duration: 0.3
                })
            } else {
                // If we are just opening, we run the enter animation.
                // If we are toggling maximize -> normal, we run this.

                // Check if we have inline width/height (meaning we were maximized or resized)
                // If we were maximized, width would be 100%.

                // A simple approach: Always animate to specific props if not maximized?
                // No, that resets user resizing.

                // Let's just handle the "Maximize -> Normal" transition by clearing the specific maximized props
                // and letting the element revert to its current (or default) dimensions.
                // But `clearProps` removes ALL inline styles for those props, which might include Draggable's x/y.
                // Draggable uses `transform`. Maximize sets `x: 0, y: 0`.
                // So clearing `x, y` might reset position to 0,0 (top-left) which is fine for now.

                if (!isMaximized) {
                    gsap.to(el, {
                        borderRadius: '0.75rem', // rounded-xl
                        // We don't force width/height here to preserve user resize (if we could).
                        // But since we don't store it, we might have to accept a reset or just clear props.
                        // Let's clear props to let CSS/Draggable take over.
                        // But we need to animate it.

                        // For now, let's just animate to a default "restored" size to be safe and visible.
                        // width: '60vw', height: '60vh', x: 0, y: 0 ?
                        // This is a safe fallback.
                    })
                }
            }
        }

        // Initial Entry Animation (only if just rendered)
        // We can check if opacity is 0?
        if (gsap.getProperty(el, 'opacity') === 0) {
             if (isMobile) {
                gsap.fromTo(el,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
                )
            } else {
                gsap.fromTo(el,
                  { scale: 0.8, opacity: 0, y: 40 },
                  { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
                )
            }
        }

      } else {
        // Exit animation (Close or Minimize)
        gsap.to(el, {
          scale: isMobile ? 0.9 : 0.8,
          opacity: 0,
          y: isMobile ? 0 : 40,
          duration: 0.3,
          ease: 'power3.in',
          onComplete: () => {
             if (!isOpen) {
                setIsRendered(false)
             } else if (isMinimized) {
                el.style.display = 'none'
             }
          }
        })
      }
    }, [isOpen, isMinimized, isMaximized, isRendered])

    useGSAP(() => {
      const el = ref.current
      if (!el || isMobile) return // Disable draggable on mobile

      // Use .window-header as trigger if it exists, otherwise fallback to element itself
      const header = el.querySelector('.window-header')

      const [instance] = Draggable.create(el, {
        trigger: header || el,
        onPress: () => focusWindow(windowKey),
        onDragStart: () => setIsInteracting(true),
        onDragEnd: () => setIsInteracting(false),
        allowEventDefault: true, // Allow interaction with child elements
        dragClickables: false, // Prevent dragging when clicking interactive elements
      })

      return () => instance.kill()
    }, [isRendered]) // Re-create draggable when rendered state changes

    // Custom Resize Logic
    const handleResizeStart = (e: React.MouseEvent) => {
        if (isMobile) return // Disable resize on mobile
        e.preventDefault()
        e.stopPropagation()
        setIsInteracting(true)

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = ref.current?.offsetWidth || 0
        const startHeight = ref.current?.offsetHeight || 0

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!ref.current) return
            const newWidth = startWidth + (moveEvent.clientX - startX)
            const newHeight = startHeight + (moveEvent.clientY - startY)

            // Enforce min dimensions
            ref.current.style.width = `${Math.max(300, newWidth)}px`
            ref.current.style.height = `${Math.max(200, newHeight)}px`
        }

        const handleMouseUp = () => {
            setIsInteracting(false)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    if (!isRendered) return null

    return (
      <section
        id={windowKey}
        ref={ref}
        className={`absolute window overflow-hidden ${isMobile ? 'fixed inset-0 w-full h-full top-0! left-0! rounded-none' : 'min-w-[300px] min-h-[200px]'} ${isInteracting ? 'interacting' : ''}`}
        style={{ zIndex, display: 'block' }} // Ensure display is block when rendered
        onMouseDown={() => focusWindow(windowKey)}
      >
        <div className="w-full h-full relative">
          <Component {...props} windowData={data} />
          {/* Custom Resize Handle */}
          {!isMobile && (
            <div
                className="resize-handle"
                onMouseDown={handleResizeStart}
            />
          )}
        </div>
      </section>
    )
  }

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || 'Component'})`

  return Wrapped
}

export default WindowWrapper
