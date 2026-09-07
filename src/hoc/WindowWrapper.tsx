import React, { useEffect, useRef, useState } from 'react'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'
import { useGSAP } from '@gsap/react'
import { Draggable } from 'gsap/Draggable'
import gsap from 'gsap'

interface NormalBounds {
  width: number
  height: number
  top: number
  left: number
  x: number
  y: number
}

const WindowWrapper = (Component: React.ComponentType<Record<string, unknown>>, windowKey: WindowKey) => {
  const Wrapped = (props: Record<string, unknown>) => {
    const isOpen = useWindowStore((state) => state.windows[windowKey].isOpen)
    const isMinimized = useWindowStore((state) => state.windows[windowKey].isMinimized)
    const isMaximized = useWindowStore((state) => state.windows[windowKey].isMaximized)
    const zIndex = useWindowStore((state) => state.windows[windowKey].zIndex)
    const data = useWindowStore((state) => state.windows[windowKey].data)
    const focusWindow = useWindowStore((state) => state.focusWindow)

    const ref = useRef<HTMLElement>(null)
    const normalBoundsRef = useRef<NormalBounds | null>(null)
    const wasMaximizedRef = useRef(false)
    const [isRendered, setIsRendered] = useState(isOpen)
    const [isInteracting, setIsInteracting] = useState(false)
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
      if (isOpen) setIsRendered(true)
    }, [isOpen])

    useGSAP(() => {
      const element = ref.current
      if (!element || !isRendered) return

      if (!isOpen || isMinimized) {
        gsap.to(element, {
          scale: isMobile ? 0.96 : 0.88,
          opacity: 0,
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => {
            if (!isOpen) setIsRendered(false)
            if (isMinimized) element.style.display = 'none'
          },
        })
        return
      }

      element.style.display = 'block'
      gsap.set(element, { pointerEvents: 'auto' })

      if (isMobile) {
        gsap.to(element, {
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          x: 0,
          y: 0,
          borderRadius: 0,
          opacity: 1,
          scale: 1,
          duration: 0.24,
          ease: 'power2.out',
        })
        return
      }

      if (isMaximized) {
        if (!wasMaximizedRef.current) {
          normalBoundsRef.current = {
            width: element.offsetWidth,
            height: element.offsetHeight,
            top: element.offsetTop,
            left: element.offsetLeft,
            x: Number(gsap.getProperty(element, 'x')) || 0,
            y: Number(gsap.getProperty(element, 'y')) || 0,
          }
        }

        wasMaximizedRef.current = true
        gsap.to(element, {
          width: '100%',
          height: 'calc(100% - 38px)',
          top: 38,
          left: 0,
          x: 0,
          y: 0,
          borderRadius: 0,
          opacity: 1,
          scale: 1,
          duration: 0.28,
          ease: 'power2.inOut',
        })
        return
      }

      if (wasMaximizedRef.current && normalBoundsRef.current) {
        const bounds = normalBoundsRef.current
        wasMaximizedRef.current = false
        gsap.to(element, {
          width: bounds.width,
          height: bounds.height,
          top: bounds.top,
          left: bounds.left,
          x: bounds.x,
          y: bounds.y,
          borderRadius: '0.75rem',
          opacity: 1,
          scale: 1,
          duration: 0.28,
          ease: 'power2.inOut',
        })
        return
      }

      gsap.fromTo(
        element,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.24, ease: 'power2.out' },
      )
    }, [isOpen, isMinimized, isMaximized, isRendered, isMobile])

    useGSAP(() => {
      const element = ref.current
      if (!element || isMobile || !isRendered) return

      const [instance] = Draggable.create(element, {
        trigger: element.querySelector('.window-header') || element,
        bounds: element.parentElement,
        onPress: () => focusWindow(windowKey),
        onDragStart: () => setIsInteracting(true),
        onDragEnd: () => setIsInteracting(false),
        allowEventDefault: true,
        dragClickables: false,
      })

      return () => instance.kill()
    }, [isRendered, isMobile])

    const handleResizeStart = (event: React.MouseEvent) => {
      if (isMobile || isMaximized || !ref.current) return

      event.preventDefault()
      event.stopPropagation()
      setIsInteracting(true)

      const element = ref.current
      const startX = event.clientX
      const startY = event.clientY
      const startWidth = element.offsetWidth
      const startHeight = element.offsetHeight

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const maxWidth = Math.max(320, window.innerWidth - element.getBoundingClientRect().left)
        const maxHeight = Math.max(240, window.innerHeight - element.getBoundingClientRect().top)
        element.style.width = `${Math.min(maxWidth, Math.max(320, startWidth + moveEvent.clientX - startX))}px`
        element.style.height = `${Math.min(maxHeight, Math.max(240, startHeight + moveEvent.clientY - startY))}px`
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
        className={`absolute window overflow-hidden ${isMobile ? 'fixed inset-0 w-full h-full top-0! left-0! rounded-none' : 'min-w-[320px] min-h-[240px]'} ${isInteracting ? 'interacting' : ''}`}
        style={{ zIndex, display: 'block' }}
        onMouseDown={() => focusWindow(windowKey)}
        aria-hidden={isMinimized}
      >
        <div className="w-full h-full relative">
          <Component {...props} windowData={data} />
          {!isMobile && !isMaximized && (
            <div className="resize-handle" onMouseDown={handleResizeStart} aria-hidden="true" />
          )}
        </div>
      </section>
    )
  }

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || 'Component'})`
  return Wrapped
}

export default WindowWrapper
