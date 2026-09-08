import { useEffect, useRef, useState, type ComponentType, type PointerEvent } from 'react'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'
import { clampWindow, windowBounds, type WindowRect } from '../utils/windowGeometry'

const labels: Record<WindowKey, string> = { finder: 'Finder', contact: 'Contact', resume: 'Résumé', safari: 'Safari', photos: 'Gallery', terminal: 'Terminal', txtfile: 'Text preview', imgfile: 'Image preview' }

const WindowWrapper = (Component: ComponentType<Record<string, unknown>>, windowKey: WindowKey) => {
  const Wrapped = (props: Record<string, unknown>) => {
    const item = useWindowStore(state => state.windows[windowKey])
    const focusWindow = useWindowStore(state => state.focusWindow)
    const ref = useRef<HTMLElement>(null)
    const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))
    const [rect, setRect] = useState<WindowRect>(() => clampWindow({ width: windowKey === 'contact' ? 560 : 940, height: 620, left: (window.innerWidth - (windowKey === 'contact' ? 560 : 940)) / 2, top: 78 }, window.innerWidth, window.innerHeight))
    const gesture = useRef<{ mode: 'move' | 'resize'; x: number; y: number; rect: WindowRect } | null>(null)
    const [interacting, setInteracting] = useState(false)
    const isMobile = viewport.width < 768
    useEffect(() => {
      const resize = () => {
        setViewport({ width: window.innerWidth, height: window.innerHeight })
        setRect(current => clampWindow(current, window.innerWidth, window.innerHeight))
      }
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }, [])
    useEffect(() => {
      if (!item.isOpen || item.isMinimized) return
      const previous = document.activeElement as HTMLElement | null
      const frame = requestAnimationFrame(() => ref.current?.focus())
      return () => { cancelAnimationFrame(frame); if (previous?.isConnected) previous.focus() }
    }, [item.isOpen, item.isMinimized])
    const start = (event: PointerEvent<HTMLElement>, mode: 'move' | 'resize') => {
      if (isMobile || item.isMaximized || event.button !== 0) return
      if (mode === 'move' && (!(event.target as HTMLElement).closest('.window-header') || (event.target as HTMLElement).closest('button,input,a,select'))) return
      event.preventDefault()
      gesture.current = { mode, x: event.clientX, y: event.clientY, rect }
      ref.current?.setPointerCapture(event.pointerId)
      setInteracting(true)
    }
    const stop = () => { gesture.current = null; setInteracting(false) }
    if (!item.isOpen) return null
    const bounds = windowBounds(viewport.width, viewport.height)
    const geometry = isMobile ? { left: 0, top: 48, width: '100%', height: 'calc(100dvh - 140px)' } : item.isMaximized ? bounds : rect
    return (
      <section id={windowKey} ref={ref} role="dialog" aria-label={labels[windowKey]} tabIndex={-1} hidden={item.isMinimized} className={`window desktop-window${interacting ? ' interacting' : ''}`} style={{ ...geometry, zIndex: item.zIndex, display: item.isMinimized ? 'none' : 'block' }} onFocusCapture={() => { const state = useWindowStore.getState(); if (state.windows[windowKey].zIndex !== state.nextZIndex - 1) focusWindow(windowKey) }} onPointerDown={event => { focusWindow(windowKey); start(event, 'move') }} onPointerMove={event => {
        const current = gesture.current
        if (!current) return
        const dx = event.clientX - current.x, dy = event.clientY - current.y
        setRect(clampWindow(current.mode === 'move' ? { ...current.rect, left: current.rect.left + dx, top: current.rect.top + dy } : { ...current.rect, width: current.rect.width + dx, height: current.rect.height + dy }, viewport.width, viewport.height))
      }} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
        <div className="window-body"><Component {...props} windowData={item.data} />{!isMobile && !item.isMaximized && <button className="window-resize" aria-label={`Resize ${labels[windowKey]} (use arrow keys)`} title="Drag to resize, or use arrow keys" onPointerDown={event => { event.stopPropagation(); start(event, 'resize') }} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
          event.preventDefault()
          setRect(current => clampWindow({ ...current, width: current.width + (event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0), height: current.height + (event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0) }, viewport.width, viewport.height))
        }} />}</div>
      </section>
    )
  }
  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || 'Component'})`
  return Wrapped
}
export default WindowWrapper
