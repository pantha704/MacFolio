import { useState, useEffect, useRef } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { photosLinks } from '#constants'
import { ChevronLeft, ChevronRight, Search, LayoutGrid, List, Image as ImageIcon, Heart, Map, Users, Clock, X, ZoomIn, Upload, Trash2, RotateCcw } from 'lucide-react'

import initialImages from '#constants/initialImages.json'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Initialize favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gallery_favorites')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Error parsing gallery_favorites', e)
      return []
    }
  })

  // Initialize images from localStorage or fallback to initial Cloudinary URLs
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gallery_images_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        // If parsed is empty array, fallback to initialImages (unless user explicitly deleted all, but for now this is safer)
        return parsed.length > 0 ? parsed : initialImages
      }
      return initialImages
    } catch (e) {
      console.error('Error parsing gallery_images_v2 from localStorage', e)
      return initialImages
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('Gallery Images:', galleryImages)
  }, [galleryImages])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gallery_favorites', JSON.stringify(favorites))
  }, [favorites])

  // Save gallery images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gallery_images_v2', JSON.stringify(galleryImages))
  }, [galleryImages])

  // Handle Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImage])

  const toggleFavorite = (e: React.MouseEvent, src: string) => {
    e.stopPropagation()
    setFavorites(prev =>
      prev.includes(src) ? prev.filter(f => f !== src) : [...prev, src]
    )
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.secure_url) {
        setGalleryImages(prev => [data.secure_url, ...prev])
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the gallery? This will remove all uploaded photos and restore the original collection.')) {
      setGalleryImages(initialImages)
      setFavorites([]) // Optional: reset favorites too if desired, or keep them. Let's reset for a clean slate as requested.
      localStorage.setItem('gallery_images_v2', JSON.stringify(initialImages))
      localStorage.setItem('gallery_favorites', JSON.stringify([]))
    }
  }

  const handleDelete = (e: React.MouseEvent, src: string) => {
    e.stopPropagation()
    setGalleryImages(prev => prev.filter(img => img !== src))
    setFavorites(prev => prev.filter(fav => fav !== src))
    if (selectedImage === src) setSelectedImage(null)
  }

  const renderContent = () => {
    switch (activeCategory) {
      case 1: // Library
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[150px] gap-4 grid-flow-dense pb-20">
            {galleryImages.map((src, index) => {
              const isBig = index % 5 === 0;
              const isWide = index % 5 === 3;
              const isFav = favorites.includes(src);

              return (
                <div
                  key={src}
                  className={`rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all group relative cursor-zoom-in ${
                    isBig ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : 'col-span-1'
                  }`}
                  onClick={() => setSelectedImage(src)}
                >
                  <img
                    src={src}
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Image failed to load:', src)
                      e.currentTarget.style.display = 'none' // Hide broken image to show alt text clearly or maybe show a fallback
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <ZoomIn className="text-white w-6 h-6 drop-shadow-md" />
                  </div>
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => toggleFavorite(e, src)}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <button
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => handleDelete(e, src)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )
      case 2: // Memories
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <Clock className="w-12 h-12 opacity-20" />
            <p>No memories yet</p>
            <p className="text-xs text-gray-600">Click the clock icon on photos to add them here</p>
          </div>
        )
      case 3: // Places
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-full h-64 bg-[#2a2a2a] rounded-xl flex items-center justify-center border border-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <Map className="w-12 h-12 opacity-50" />
                </div>
                <p>No location data found in photos</p>
            </div>
        )
      case 5: // Favorites
        if (favorites.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                    <Heart className="w-12 h-12 opacity-20" />
                    <p>No favorites yet</p>
                    <p className="text-xs text-gray-600">Click the heart icon on photos to add them here</p>
                </div>
            )
        }
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((src) => (
                <div
                  key={src}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all group relative cursor-zoom-in"
                  onClick={() => setSelectedImage(src)}
                >
                  <img
                    src={src}
                    alt="Favorite"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white opacity-100 transition-all"
                    onClick={(e) => toggleFavorite(e, src)}
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden font-georama border border-gray-800 shadow-2xl text-gray-200">
      {/* Header */}
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-[#2a2a2a] border-b border-gray-800">
        <WindowControls target="photos" />

        <div className="flex items-center gap-2 ml-4 text-gray-400">
          <ChevronLeft className="icon w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <ChevronRight className="icon w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>

        <span className="font-semibold text-gray-200 ml-2">
            Photos
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-gray-400">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
            />
            <button
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Upload Photo"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="w-4 h-4" />
            </button>
            <button
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Reset Gallery"
                onClick={handleReset}
            >
                <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-700 mx-1" />

            <LayoutGrid className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            <List className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />

            <div className="search flex items-center gap-2 bg-[#1a1a1a] px-2 py-1 rounded-md border border-gray-700/50 focus-within:border-blue-500/50 focus-within:bg-[#1a1a1a] transition-all shadow-inner w-40">
                <Search className="w-3 h-3 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 bg-transparent outline-none text-xs text-gray-300 placeholder-gray-600"
                />
            </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-48 bg-[#252525]/80 backdrop-blur-xl border-r border-gray-800 p-2 overflow-y-auto text-sm select-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#484f58] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a626e] [scrollbar-width:thin] [scrollbar-color:#484f58_transparent]">
            <div className="mb-4">
                {/* <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1">Photos</p> */}
                <ul>
                    {photosLinks.map((item) => {
                        return (
                        <li
                            key={item.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors ${activeCategory === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                            onClick={() => setActiveCategory(item.id)}
                        >
                            {item.title === 'Library' && <ImageIcon className="w-4 h-4" />}
                            {item.title === 'Memories' && <Clock className="w-4 h-4" />}
                            {item.title === 'Places' && <Map className="w-4 h-4" />}
                            {item.title === 'People' && <Users className="w-4 h-4" />}
                            {item.title === 'Favorites' && <Heart className="w-4 h-4" />}
                            {!['Library', 'Memories', 'Places', 'People', 'Favorites'].includes(item.title) && <ImageIcon className="w-4 h-4" />}
                            <span>{item.title}</span>
                        </li>
                        )
                    })}
                </ul>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#484f58] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a626e] [scrollbar-width:thin] [scrollbar-color:#484f58_transparent]">
            {renderContent()}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                <button
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                    onClick={() => setSelectedImage(null)}
                >
                    <X className="w-6 h-6" />
                </button>
                <img
                    src={selectedImage}
                    alt="Full screen"
                    className="max-w-full max-h-full object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
                    crossOrigin="anonymous"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => {
                        console.error('Lightbox image failed:', selectedImage)
                        e.currentTarget.style.display = 'none'
                    }}
                />
            </div>
        )}
      </div>
    </div>
  )
}

const GalleryWindow = WindowWrapper(Gallery, 'photos')

export default GalleryWindow
