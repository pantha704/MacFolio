import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import initialImages from '#constants/initialImages.json'

interface SystemState {
  isWifiEnabled: boolean
  toggleWifi: () => void
  setWifi: (enabled: boolean) => void
  wallpaper: string
  setWallpaper: (url: string) => void
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
      setWallpaper: (url) => set({ wallpaper: url }),
      galleryImages: initialImages,
      setGalleryImages: (images) => set({ galleryImages: images }),
      addGalleryImage: (url) => set((state) => ({ galleryImages: [url, ...state.galleryImages] })),
    }),
    {
      name: 'system-storage',
    }
  )
)
