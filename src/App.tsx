import { lazy, Suspense, useEffect } from 'react'
import Navbar from './components/Navbar'
import Welcome from './components/Welcome'
import Dock from './components/Dock'
import DynamicWallpaper from './components/DynamicWallpaper'
import NoInternet from './components/NoInternet'
import { useSystemStore } from './store/systemStore'
import { useWindowStore, type WindowKey } from './store/useWindowStore'
import { WindowErrorBoundary } from './components/WindowErrorBoundary'

const Safari = lazy(() => import('./windows/Safari'))
const Finder = lazy(() => import('./windows/Finder'))
const Gallery = lazy(() => import('./windows/Gallery'))
const Contact = lazy(() => import('./windows/Contact'))
const Terminal = lazy(() => import('./windows/Terminal'))
const FilePreview = lazy(() => import('./windows/FilePreview'))
const Settings = lazy(() => import('./windows/Settings'))
const Arcade = lazy(() => import('./windows/Arcade'))
const apps = { settings: Settings, arcade: Arcade, safari: Safari, finder: Finder, photos: Gallery, contact: Contact, terminal: Terminal }

const App = () => {
  const { isWifiEnabled, setGalleryImages } = useSystemStore()
  const windows = useWindowStore(state => state.windows)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.key.toLowerCase() !== 'w') return
      event.preventDefault()
      const { windows, closeWindow } = useWindowStore.getState()
      const active = Object.entries(windows).filter(([, item]) => item.isOpen && !item.isMinimized).sort((a, b) => b[1].zIndex - a[1].zIndex)[0]
      if (active) closeWindow(active[0] as WindowKey)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  useEffect(() => {
    try {
      const legacy = localStorage.getItem('gallery_images_v2')
      if (legacy) {
        const parsed: unknown = JSON.parse(legacy)
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) setGalleryImages(parsed)
        localStorage.removeItem('gallery_images_v2')
      }
    } catch { /* Storage may be unavailable; the portfolio still works. */ }
  }, [setGalleryImages])
  return (
    <main className="desktop-shell">
      <a className="skip-link" href="#portfolio">Skip to portfolio</a>
      <DynamicWallpaper />
      <Navbar />
      {isWifiEnabled ? <Welcome /> : <NoInternet />}
      <Dock />
      {Object.entries(apps).map(([key, AppWindow]) => windows[key as WindowKey].isOpen && <WindowErrorBoundary key={key} windowKey={key as WindowKey}><Suspense fallback={<div role="status" className="app-loading">Opening {key}…</div>}><AppWindow /></Suspense></WindowErrorBoundary>)}
      {(['resume', 'txtfile', 'imgfile'] as const).map(key => windows[key].isOpen && <WindowErrorBoundary key={key} windowKey={key}><Suspense fallback={<div role="status" className="app-loading">Opening file…</div>}><FilePreview target={key} /></Suspense></WindowErrorBoundary>)}
    </main>
  )
}
export default App
