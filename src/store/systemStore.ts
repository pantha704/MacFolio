import { useAppearance } from './appearance'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../utils/storage'
import initialImages from '#constants/initialImages.json'

interface SystemState {
  isWifiEnabled: boolean
  toggleWifi: () => void
  setWifi: (enabled: boolean) => void
  wallpaper: string
  setWallpaper: (url: string) => void
  clearWallpaper: () => void
  galleryImages: string[]
  setGalleryImages: (images: string[]) => void
  addGalleryImage: (url: string) => void
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      isWifiEnabled: true,
      toggleWifi: () => set((state) => ({ isWifiEnabled: !state.isWifiEnabled })),
      setWifi: (enabled) => set({ isWifiEnabled: enabled }),
      wallpaper: '/images/wallpaper.png',
      setWallpaper: (url) => { set({ wallpaper: url }); useAppearance.getState().update({ scene: 'photo' }) },
      clearWallpaper: () => { set({ wallpaper: '/images/wallpaper.png' }); useAppearance.getState().update({ scene: 'living', time: 'auto' }) },
      galleryImages: initialImages,
      setGalleryImages: (images) => set({ galleryImages: [...new Set(images)] }),
      addGalleryImage: (url) => set((state) => ({ galleryImages: [...new Set([url, ...state.galleryImages])] })),
    }),
    {
      name: 'system-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: state => ({ wallpaper: state.wallpaper, galleryImages: state.galleryImages }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<SystemState> | undefined
        return { ...current, wallpaper: typeof saved?.wallpaper === 'string' ? saved.wallpaper : current.wallpaper, galleryImages: Array.isArray(saved?.galleryImages) && saved.galleryImages.every(item => typeof item === 'string') ? [...new Set(saved.galleryImages)] : current.galleryImages }
      },
    }
  )
)
