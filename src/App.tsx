import { useEffect } from 'react'
import { Navbar, Welcome, Dock, NoInternet } from "#components";
import { Terminal, Safari, Finder, Gallery, Contact } from "#windows";
import { Draggable } from "gsap/Draggable"
import gsap from "gsap"
import { useSystemStore } from "./store/systemStore"
import { useWindowStore } from "./store/useWindowStore"

gsap.registerPlugin(Draggable)

const App = () => {
  const { isWifiEnabled, wallpaper, setGalleryImages } = useSystemStore()

  // Global key listener for Ctrl+W
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Use Alt+W instead of Ctrl+W to avoid browser conflict
        if (e.altKey && (e.key === 'w' || e.key === 'W')) {
            e.preventDefault()
            e.stopPropagation()

            const { windows, closeWindow } = useWindowStore.getState() // Access store directly
            // Find active window (highest zIndex among open & not minimized)
            const openWindows = Object.entries(windows).filter(([, w]) => w.isOpen && !w.isMinimized)
            if (openWindows.length === 0) return

            const maxZ = Math.max(...openWindows.map(([, w]) => w.zIndex))
            const activeWindowEntry = openWindows.find(([, w]) => w.zIndex === maxZ)

            if (activeWindowEntry) {
                const [key] = activeWindowEntry
                closeWindow(key as any)
            }
        }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Migrate legacy gallery images
  useEffect(() => {
    const legacyImages = localStorage.getItem('gallery_images_v2')
    if (legacyImages) {
        try {
            const parsed = JSON.parse(legacyImages)
            if (Array.isArray(parsed) && parsed.length > 0) {
                setGalleryImages(parsed)
            }
            localStorage.removeItem('gallery_images_v2') // Clear legacy key after migration
        } catch (e) {
            console.error('Failed to migrate legacy gallery images', e)
        }
    }
  }, [setGalleryImages])

  console.log('Current wallpaper:', wallpaper)

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Wallpaper Image with CORS support */}
      <div className="absolute inset-0">
        <img
            key={wallpaper} // Force re-render on change
            src={wallpaper}
            alt="wallpaper"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => console.error("Wallpaper load error:", e)}
        />
      </div>

      <Navbar />
      {isWifiEnabled ? (
        <>
            <Welcome />
            <Dock />

            <Safari />
            <Finder />
            <Terminal />
            <Gallery />
            <Contact />
        </>
      ) : (
        <NoInternet />
      )}
    </main>
  )
}

export default App
