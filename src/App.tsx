import { useEffect } from 'react'
import { Navbar, Welcome, Dock, NoInternet } from "#components";
import { Terminal, Safari, Finder, Gallery } from "#windows";
import { Draggable } from "gsap/Draggable"
import gsap from "gsap"
import { useSystemStore } from "./store/systemStore"

gsap.registerPlugin(Draggable)

const App = () => {
  const { isWifiEnabled, wallpaper, setGalleryImages } = useSystemStore()

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
  }, [])

  console.log('Current wallpaper:', wallpaper)

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Wallpaper Image with CORS support */}
      <div className="absolute inset-0">
        <img
            key={wallpaper} // Force re-render on change
            src={`${wallpaper}?t=${Date.now()}`}
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
        </>
      ) : (
        <NoInternet />
      )}
    </main>
  )
}

export default App
