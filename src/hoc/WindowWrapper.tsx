import { useEffect, useRef, useState, type ComponentType, type PointerEvent } from 'react'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'
import { clampWindow, windowBounds, type WindowRect } from '../utils/windowGeometry'
import { appRegistry } from '../desktop/appRegistry'
import { safeStorage } from '../utils/storage'

type Viewport = { width: number; height: number; left: number; top: number }
const viewportNow = (): Viewport => {
  const visual = window.visualViewport
  return { width: visual?.width ?? window.innerWidth, height: visual?.height ?? window.innerHeight, left: visual?.offsetLeft ?? 0, top: visual?.offsetTop ?? 0 }
}
const geometryKey = (key: WindowKey) => `macfolio-window-${key}`
function defaultRect(key: WindowKey, viewport: Viewport): WindowRect {
  const size = appRegistry[key].defaultSize
  const fallback = { ...size, left: (viewport.width - size.width) / 2, top: 76 }
  try {
    const saved = JSON.parse(safeStorage.getItem(geometryKey(key)) ?? 'null') as Partial<WindowRect> | null
    if (saved && ['left', 'top', 'width', 'height'].every(part => Number.isFinite(saved[part as keyof WindowRect]))) return clampWindow(saved as WindowRect, viewport.width, viewport.height)
  } catch { /* A corrupt layout falls back to a centered window. */ }
  return clampWindow(fallback, viewport.width, viewport.height)
}

const WindowWrapper = (Component: ComponentType<Record<string, unknown>>, windowKey: WindowKey) => {
  const Wrapped = (props: Record<string, unknown>) => {
    const item = useWindowStore(state => state.windows[windowKey])
    const focused = useWindowStore(state => state.focusedWindow === windowKey)
    const focusWindow = useWindowStore(state => state.focusWindow)
    const ref = useRef<HTMLElement>(null)
    const [viewport, setViewport] = useState(viewportNow)
    const [rect, setRect] = useState<WindowRect>(() => defaultRect(windowKey, viewportNow()))
    const gesture = useRef<{ mode: 'move' | 'resize'; pointerId: number; x: number; y: number; rect: WindowRect } | null>(null)
    const nextRect = useRef<WindowRect | null>(null)
    const gestureFrame = useRef(0)
    const wasVisible = useRef(false)
    const [interacting, setInteracting] = useState(false)
    const isMobile = viewport.width < 768

    useEffect(() => {
      const resize = () => {
        const next = viewportNow()
        setViewport(next)
        setRect(current => clampWindow(current, next.width, next.height))
      }
      const visual = window.visualViewport
      window.addEventListener('resize', resize)
      visual?.addEventListener('resize', resize)
      visual?.addEventListener('scroll', resize)
      return () => {
        window.removeEventListener('resize', resize)
        visual?.removeEventListener('resize', resize)
        visual?.removeEventListener('scroll', resize)
      }
    }, [])

    useEffect(() => {
      const visible = item.isOpen && !item.isMinimized
      if (visible && !wasVisible.current && focused) requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }))
      wasVisible.current = visible
    }, [focused, item.isMinimized, item.isOpen])

    useEffect(() => () => cancelAnimationFrame(gestureFrame.current), [])

    const commit = (next: WindowRect) => {
      setRect(next)
      safeStorage.setItem(geometryKey(windowKey), JSON.stringify(next))
    }
    const start = (event: PointerEvent<HTMLElement>, mode: 'move' | 'resize') => {
      if (isMobile || item.isMaximized || event.button !== 0) return
      const target = event.target as HTMLElement
      if (mode === 'move' && (!target.closest('.window-header') || target.closest('button,input,a,select,textarea,[contenteditable="true"],[data-window-no-drag]'))) return
      event.preventDefault()
      focusWindow(windowKey)
      gesture.current = { mode, pointerId: event.pointerId, x: event.clientX, y: event.clientY, rect }
      ref.current?.setPointerCapture(event.pointerId)
      setInteracting(true)
    }
    const stop = () => {
      if (nextRect.current) commit(nextRect.current)
      nextRect.current = null
      gesture.current = null
      cancelAnimationFrame(gestureFrame.current)
      setInteracting(false)
    }
    if (!item.isOpen) return null
    const bounds = windowBounds(viewport.width, viewport.height)
    const geometry = isMobile
      ? { left: viewport.left, top: Math.max(48, viewport.top), width: viewport.width, height: Math.max(220, viewport.height - 140) }
      : item.isMaximized ? bounds : rect

    return (
      <section id={windowKey} ref={ref} role="region" aria-label={appRegistry[windowKey].name} aria-hidden={item.isMinimized} tabIndex={-1} hidden={item.isMinimized} className={`window desktop-window${interacting ? ' interacting' : ''}${focused ? ' is-focused' : ''}`} style={{ ...geometry, zIndex: item.zIndex, display: item.isMinimized ? 'none' : 'block' }} onPointerDown={event => { if (!focused) focusWindow(windowKey); start(event, 'move') }} onPointerMove={event => {
        const current = gesture.current
        if (!current || current.pointerId !== event.pointerId) return
        const dx = event.clientX - current.x
        const dy = event.clientY - current.y
        nextRect.current = clampWindow(current.mode === 'move' ? { ...current.rect, left: current.rect.left + dx, top: current.rect.top + dy } : { ...current.rect, width: current.rect.width + dx, height: current.rect.height + dy }, viewport.width, viewport.height)
        cancelAnimationFrame(gestureFrame.current)
        gestureFrame.current = requestAnimationFrame(() => { if (nextRect.current) setRect(nextRect.current) })
      }} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
        <div className="window-body"><Component {...props} windowData={item.data} />{!isMobile && !item.isMaximized && <button className="window-resize" aria-label={`Resize ${appRegistry[windowKey].name}`} title="Drag to resize; arrow keys also work" onPointerDown={event => { event.stopPropagation(); start(event, 'resize') }} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
          event.preventDefault()
          const next = clampWindow({ ...rect, width: rect.width + (event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0), height: rect.height + (event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0) }, viewport.width, viewport.height)
          commit(next)
        }} />}</div>
      </section>
    )
  }
  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || 'Component'})`
  return Wrapped
}
export default WindowWrapper
