import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { ArrowLeft, ArrowRight, Heart, Image as ImageIcon, Monitor, RotateCcw, Trash2, Upload, X } from 'lucide-react'
import initialImages from '#constants/initialImages.json'
import { useSystemStore } from '#store/systemStore'
import { readFavorites, safeSave } from '../utils/storage'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const canUpload = Boolean(cloudName && uploadPreset)

function Lightbox({ images: initialCollection, initial, favorites, onFavorite, onClose }: { images: string[]; initial: string; favorites: string[]; onFavorite: (src: string) => void; onClose: () => void }) {
  const [images] = useState(initialCollection)
  const dialog = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState(initial)
  const wallpaper = useSystemStore(state => state.wallpaper)
  const setWallpaper = useSystemStore(state => state.setWallpaper)
  const index = images.indexOf(selected)
  const step = (delta: number) => { if (images.length) setSelected(images[(Math.max(0, index) + delta + images.length) % images.length]) }
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; dialog.current?.showModal(); return () => previous?.focus() }, [])
  return createPortal(<dialog ref={dialog} className="gallery-lightbox" aria-label="Photo preview" onCancel={onClose} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); step(1) } }} onClick={event => { if (event.target === event.currentTarget) onClose() }}><div className="lightbox-toolbar"><span>{Math.max(0, index) + 1} / {images.length}</span><div><button onClick={() => setWallpaper(wallpaper === selected ? '/images/wallpaper.png' : selected)} aria-label={wallpaper === selected ? 'Reset wallpaper' : 'Set as wallpaper'} title={wallpaper === selected ? 'Reset wallpaper' : 'Set as wallpaper'} aria-pressed={wallpaper === selected}><Monitor size={20} /></button><button onClick={() => onFavorite(selected)} aria-label={favorites.includes(selected) ? 'Remove favorite' : 'Add favorite'} aria-pressed={favorites.includes(selected)}><Heart size={20} fill={favorites.includes(selected) ? 'currentColor' : 'none'} /></button><button onClick={onClose} aria-label="Close photo"><X size={22} /></button></div></div><div className="lightbox-image"><button onClick={() => step(-1)} aria-label="Previous photo"><ArrowLeft size={24} /></button><img src={selected} alt="Selected gallery photograph" crossOrigin="anonymous" /><button onClick={() => step(1)} aria-label="Next photo"><ArrowRight size={24} /></button></div><p>Use ← → to browse · Esc to close</p></dialog>, document.body)
}
const Gallery = () => {
  const [category, setCategory] = useState<'all' | 'favorites'>('all')
  const [favorites, setFavorites] = useState<string[]>(readFavorites)
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const { galleryImages, setGalleryImages, addGalleryImage, wallpaper, setWallpaper } = useSystemStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => abort.current?.abort(), [])
  const favorite = (src: string) => {
    const next = favorites.includes(src) ? favorites.filter(item => item !== src) : [...favorites, src]
    setFavorites(next)
    if (!safeSave('gallery_favorites', JSON.stringify(next))) setStatus('Favorites are available for this visit. This browser couldn’t save them.')
  }
  const remove = (src: string) => {
    if (!window.confirm('Remove this photo from your gallery on this device? The original cloud image will remain.')) return
    setGalleryImages(galleryImages.filter(item => item !== src))
    const next = favorites.filter(item => item !== src)
    setFavorites(next); safeSave('gallery_favorites', JSON.stringify(next))
    if (wallpaper === src) setWallpaper('/images/wallpaper.png')
    setStatus('Photo removed from this device’s gallery.')
  }
  const reset = () => {
    if (!window.confirm('Restore the original collection and clear favorites on this device? Cloud uploads will remain in Cloudinary.')) return
    setGalleryImages(initialImages); setFavorites([]); safeSave('gallery_favorites', '[]'); setWallpaper('/images/wallpaper.png'); setStatus('Original collection restored.')
  }
  const upload = async (file?: File) => {
    if (!file || !canUpload || uploading) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) { setStatus('Choose a JPG, PNG, WebP, or GIF under 10 MB.'); return }
    setUploading(true); setStatus('Uploading photo…')
    const controller = new AbortController(); abort.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 30_000)
    try {
      const data = new FormData(); data.append('file', file); data.append('upload_preset', uploadPreset)
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body: data, signal: controller.signal })
      if (!response.ok) throw new Error('Upload failed')
      const result = await response.json()
      if (typeof result.secure_url !== 'string' || !result.secure_url.startsWith('https://')) throw new Error('Invalid upload')
      addGalleryImage(result.secure_url); setCategory('all'); setStatus('Photo uploaded. It’s now in your gallery.')
    } catch { setStatus('The upload didn’t finish. Check your connection and try again.') }
    finally { clearTimeout(timeout); setUploading(false); if (fileInput.current) fileInput.current.value = '' }
  }
  const images = category === 'all' ? galleryImages : galleryImages.filter(src => favorites.includes(src))
  return <div className="gallery-app"><div className="window-header gallery-toolbar"><WindowControls target="photos" /><span>Photos</span><div><input ref={fileInput} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => void upload(event.target.files?.[0])} />{canUpload && <button disabled={uploading} onClick={() => fileInput.current?.click()} aria-label="Upload photo" title="Upload photo"><Upload size={18} /></button>}<button onClick={reset} aria-label="Reset gallery" title="Reset gallery"><RotateCcw size={18} /></button></div></div><div className="gallery-tabs" aria-label="Photo collections"><button aria-pressed={category === 'all'} onClick={() => setCategory('all')}><ImageIcon size={16} />All photos<span>{galleryImages.length}</span></button><button aria-pressed={category === 'favorites'} onClick={() => setCategory('favorites')}><Heart size={16} />Favorites</button></div>{status && <p className="gallery-status" role="status">{status}</p>}<div className="gallery-scroll">{images.length ? <div className="photo-grid">{images.map((src, index) => <div key={src} className="photo-tile"><button className="photo-open" onClick={() => setSelected(src)} aria-label={`Open photo ${index + 1}`}><img src={src} alt={`Gallery photograph ${index + 1}`} loading="lazy" decoding="async" crossOrigin="anonymous" /></button><div className="photo-actions"><button aria-label={favorites.includes(src) ? 'Remove favorite' : 'Add favorite'} aria-pressed={favorites.includes(src)} onClick={() => favorite(src)}><Heart size={16} fill={favorites.includes(src) ? 'currentColor' : 'none'} /></button><button aria-label="Remove photo from this device" onClick={() => remove(src)}><Trash2 size={16} /></button></div></div>)}</div> : <p className="empty-state">{category === 'favorites' ? 'No favorites yet. Tap the heart on a photo to save it here.' : 'Your collection is empty. Restore the original gallery to start exploring.'}</p>}</div>{selected && <Lightbox images={images} initial={selected} favorites={favorites} onFavorite={favorite} onClose={() => setSelected(null)} />}</div>
}
export default WindowWrapper(Gallery, 'photos')
