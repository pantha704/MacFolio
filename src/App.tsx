import { lazy, Suspense, useEffect } from 'react'
import { Navbar, Welcome, Dock } from '#components'
import { Draggable } from 'gsap/Draggable'
import gsap from 'gsap'
import { useSystemStore } from '#store/systemStore'
import { useWindowStore } from '#store/useWindowStore'

gsap.registerPlugin(Draggable)

const Finder = lazy(() => import('./windows/Finder'))
const Safari = lazy(() => import('./windows/Safari'))
const Terminal = lazy(() => import('./windows/Terminal'))
const Gallery = lazy(() => import('./windows/Gallery'))
const Contact = lazy(() => import('./windows/Contact'))
const Preview = lazy(() => import('./windows/Preview'))

const App = () => {
  const isWifiEnabled = useSystemStore((state) => state.isWifiEnabled)
  const wallpaper = useSystemStore((state) => state.wallpaper)
  const setGalleryImages = useSystemStore((state) => state.setGalleryImages)

  const finderOpen = useWindowStore((state) => state.windows.finder.isOpen)
  const safariOpen = useWindowStore((state) => state.windows.safari.isOpen)
  const terminalOpen = useWindowStore((state) => state.windows.terminal.isOpen)
  const photosOpen = useWindowStore((state) => state.windows.photos.isOpen)
  const contactOpen = useWindowStore((state) => state.windows.contact.isOpen)
  const previewOpen = useWindowStore((state) => state.windows.preview.isOpen)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'w') {
        event.preventDefault()

        const { windows, closeWindow } = useWindowStore.getState()
        const visibleWindows = Object.entries(windows).filter(([, window]) => window.isOpen && !window.isMinimized)
        if (visibleWindows.length === 0) return

        const activeWindow = visibleWindows.reduce((top, entry) => (
          entry[1].zIndex > top[1].zIndex ? entry : top
        ))

        closeWindow(activeWindow[0] as keyof typeof windows)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const legacyImages = localStorage.getItem('gallery_images_v2')
    if (!legacyImages) return

    try {
      const parsed = JSON.parse(legacyImages)
      if (Array.isArray(parsed) && parsed.length > 0) setGalleryImages(parsed)
    } catch {
      // Ignore malformed legacy data and keep the curated default gallery.
    } finally {
      localStorage.removeItem('gallery_images_v2')
    }
  }, [setGalleryImages])

  return (
    <main className="relative w-full h-dvh overflow-hidden bg-black">
      <img
        key={wallpaper}
        src={wallpaper}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <Navbar />
      <Welcome />
      <Dock />

      {!isWifiEnabled && (
        <div
          className="absolute top-12 right-3 z-[9000] rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur-2xl shadow-xl"
          role="status"
        >
          Wi-Fi Off · local apps still work
        </div>
      )}

      <Suspense fallback={null}>
        {finderOpen && <Finder />}
        {safariOpen && <Safari />}
        {terminalOpen && <Terminal />}
        {photosOpen && <Gallery />}
        {contactOpen && <Contact />}
        {previewOpen && <Preview />}
      </Suspense>
    </main>
  )
}

export default App
