import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Image as ImageIcon,
  Monitor,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import initialImages from '#constants/initialImages.json'
import { useSystemStore } from '#store/systemStore'
import { useAppearance } from '../store/appearance'
import { readFavorites, safeSave } from '../utils/storage'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const canUpload = Boolean(cloudName && uploadPreset)

function Lightbox({
  images: initialCollection,
  initial,
  favorites,
  onFavorite,
  onClose,
}: {
  images: string[]
  initial: string
  favorites: string[]
  onFavorite: (src: string) => void
  onClose: () => void
}) {
  const [images] = useState(initialCollection)
  const dialog = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState(initial)
  const wallpaper = useSystemStore((state) => state.wallpaper)
  const photoScene = useAppearance((state) => state.scene === 'photo')
  const activeWallpaper = photoScene && wallpaper === selected
  const setWallpaper = useSystemStore((state) => state.setWallpaper)
  const clearWallpaper = useSystemStore((state) => state.clearWallpaper)
  const index = images.indexOf(selected)
  const step = (delta: number) => {
    if (images.length)
      setSelected(
        images[(Math.max(0, index) + delta + images.length) % images.length],
      )
  }
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    return () => previous?.focus()
  }, [])
  return createPortal(
    <dialog
      ref={dialog}
      className="gallery-lightbox"
      aria-label="Photo preview"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          step(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          step(1)
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="lightbox-toolbar">
        <span>
          {Math.max(0, index) + 1} / {images.length}
        </span>
        <div>
          <button
            onClick={() =>
              activeWallpaper ? clearWallpaper() : setWallpaper(selected)
            }
            aria-label={
              activeWallpaper
                ? 'Return to automatic wallpaper'
                : 'Set as wallpaper'
            }
            title={
              activeWallpaper
                ? 'Return to automatic wallpaper'
                : 'Set as wallpaper'
            }
            aria-pressed={activeWallpaper}
          >
            <Monitor size={20} />
          </button>
          <button
            onClick={() => onFavorite(selected)}
            aria-label={
              favorites.includes(selected) ? 'Remove favorite' : 'Add favorite'
            }
            aria-pressed={favorites.includes(selected)}
          >
            <Heart
              size={20}
              fill={favorites.includes(selected) ? 'currentColor' : 'none'}
            />
          </button>
          <button onClick={onClose} aria-label="Close photo">
            <X size={22} />
          </button>
        </div>
      </div>
      <div className="lightbox-image">
        <button onClick={() => step(-1)} aria-label="Previous photo">
          <ArrowLeft size={24} />
        </button>
        <img
          src={selected}
          alt={`Gallery photograph ${Math.max(0, index) + 1}`}
          crossOrigin="anonymous"
          draggable={false}
        />
        <button onClick={() => step(1)} aria-label="Next photo">
          <ArrowRight size={24} />
        </button>
      </div>
      <p>Use ← → to browse · Esc to close</p>
    </dialog>,
    document.body,
  )
}
const Gallery = () => {
  const [category, setCategory] = useState<'all' | 'favorites'>('all')
  const [favorites, setFavorites] = useState<string[]>(readFavorites)
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [removed, setRemoved] = useState<{
    src: string
    index: number
    wasFavorite: boolean
    wasWallpaper: boolean
  } | null>(null)
  const {
    galleryImages,
    setGalleryImages,
    addGalleryImage,
    wallpaper,
    clearWallpaper,
  } = useSystemStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => abort.current?.abort(), [])
  const favorite = (src: string) => {
    const next = favorites.includes(src)
      ? favorites.filter((item) => item !== src)
      : [...favorites, src]
    setFavorites(next)
    if (!safeSave('gallery_favorites', JSON.stringify(next)))
      setStatus(
        'Favorites are available for this visit. This browser couldn’t save them.',
      )
  }
  const remove = (src: string) => {
    if (
      !window.confirm(
        'Remove this photo from your gallery on this device? The original cloud image will remain.',
      )
    )
      return
    const index = galleryImages.indexOf(src)
    setGalleryImages(galleryImages.filter((item) => item !== src))
    setRemoved({
      src,
      index,
      wasFavorite: favorites.includes(src),
      wasWallpaper:
        wallpaper === src && useAppearance.getState().scene === 'photo',
    })
    const next = favorites.filter((item) => item !== src)
    setFavorites(next)
    safeSave('gallery_favorites', JSON.stringify(next))
    if (wallpaper === src && useAppearance.getState().scene === 'photo')
      clearWallpaper()
    setStatus(
      'Photo removed from this device’s gallery. You can undo this action.',
    )
  }
  const reset = () => {
    const missing = initialImages.filter((src) => !galleryImages.includes(src))
    if (!missing.length) {
      setStatus('The original collection is already complete.')
      return
    }
    setGalleryImages([...galleryImages, ...missing])
    setStatus(
      `${missing.length} original ${missing.length === 1 ? 'photo' : 'photos'} restored. Favorites and your wallpaper were not changed.`,
    )
  }
  const upload = async (file?: File) => {
    if (!file || !canUpload || uploading) return
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
        file.type,
      ) ||
      file.size > 10 * 1024 * 1024
    ) {
      setStatus('Choose a JPG, PNG, WebP, or GIF under 10 MB.')
      return
    }
    setUploading(true)
    setStatus('Uploading photo…')
    const controller = new AbortController()
    abort.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 30_000)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', uploadPreset)
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
        { method: 'POST', body: data, signal: controller.signal },
      )
      if (!response.ok) throw new Error('Upload failed')
      const result = await response.json()
      if (
        typeof result.secure_url !== 'string' ||
        !result.secure_url.startsWith('https://')
      )
        throw new Error('Invalid upload')
      addGalleryImage(result.secure_url)
      setCategory('all')
      setStatus('Photo uploaded. It’s now in your gallery.')
    } catch {
      setStatus(
        'The upload didn’t finish. Check your connection and try again.',
      )
    } finally {
      clearTimeout(timeout)
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }
  const images =
    category === 'all'
      ? galleryImages
      : galleryImages.filter((src) => favorites.includes(src))
  const undo = () => {
    if (!removed) return
    const next = galleryImages.filter((src) => src !== removed.src)
    next.splice(Math.max(0, removed.index), 0, removed.src)
    setGalleryImages(next)
    if (removed.wasFavorite) {
      const restored = [...new Set([...favorites, removed.src])]
      setFavorites(restored)
      safeSave('gallery_favorites', JSON.stringify(restored))
    }
    if (removed.wasWallpaper)
      useSystemStore.getState().setWallpaper(removed.src)
    setRemoved(null)
    setStatus('Photo restored.')
  }
  return (
    <div className="gallery-app">
      <div className="window-header gallery-toolbar">
        <WindowControls target="photos" />
        <span>Photos</span>
        <div data-window-no-drag>
          <input
            ref={fileInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => void upload(event.target.files?.[0])}
          />
          {canUpload && (
            <button
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              aria-label="Upload photo"
              title="Upload photo"
            >
              <Upload size={18} />
            </button>
          )}
          <button
            onClick={reset}
            aria-label="Restore original photos"
            title="Restore original photos"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
      <div className="gallery-tabs" aria-label="Photo collections">
        <button
          aria-pressed={category === 'all'}
          onClick={() => setCategory('all')}
        >
          <ImageIcon size={16} />
          All photos<span>{galleryImages.length}</span>
        </button>
        <button
          aria-pressed={category === 'favorites'}
          onClick={() => setCategory('favorites')}
        >
          <Heart size={16} />
          Favorites
        </button>
      </div>
      {status && (
        <p className="gallery-status" role="status">
          {status}
          {removed && <button onClick={undo}>Undo</button>}
        </p>
      )}
      <div className="gallery-scroll">
        {images.length ? (
          <div className="photo-grid">
            {images.map((src, index) => (
              <div key={src} className="photo-tile">
                <button
                  className="photo-open"
                  onClick={() => setSelected(src)}
                  aria-label={`Open photo ${index + 1}`}
                >
                  <img
                    src={src}
                    alt={`Gallery photograph ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                </button>
                <div className="photo-actions">
                  <button
                    aria-label={
                      favorites.includes(src)
                        ? 'Remove favorite'
                        : 'Add favorite'
                    }
                    aria-pressed={favorites.includes(src)}
                    onClick={() => favorite(src)}
                  >
                    <Heart
                      size={16}
                      fill={favorites.includes(src) ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    aria-label="Remove photo from this device"
                    onClick={() => remove(src)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            {category === 'favorites'
              ? 'No favorites yet. Tap the heart on a photo to save it here.'
              : 'Your collection is empty. Restore the original gallery to start exploring.'}
          </p>
        )}
      </div>
      {selected && (
        <Lightbox
          images={images}
          initial={selected}
          favorites={favorites}
          onFavorite={favorite}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
export default WindowWrapper(Gallery, 'photos')
