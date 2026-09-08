import { X, Minus, Maximize2, Minimize2 } from 'lucide-react'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'

const WindowControls = ({ target }: { target: WindowKey }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, windows } = useWindowStore()
  const isMaximized = windows[target].isMaximized
  return <div className="window-controls" aria-label="Window controls">
    <button className="traffic-light close" aria-label="Close window" title="Close (Alt W)" onClick={event => { event.stopPropagation(); closeWindow(target) }}><X size={10} /></button>
    <button className="traffic-light minimize" aria-label="Minimize window" title="Minimize" onClick={event => { event.stopPropagation(); minimizeWindow(target) }}><Minus size={10} /></button>
    <button className="traffic-light maximize" aria-label={isMaximized ? 'Restore window size' : 'Maximize window'} title={isMaximized ? 'Restore' : 'Maximize'} onClick={event => { event.stopPropagation(); maximizeWindow(target) }}>{isMaximized ? <Minimize2 size={9} /> : <Maximize2 size={9} />}</button>
  </div>
}
export default WindowControls
