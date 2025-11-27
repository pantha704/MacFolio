import { create } from 'zustand'

interface SystemState {
  isWifiEnabled: boolean
  toggleWifi: () => void
  setWifi: (enabled: boolean) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  isWifiEnabled: true,
  toggleWifi: () => set((state) => ({ isWifiEnabled: !state.isWifiEnabled })),
  setWifi: (enabled) => set({ isWifiEnabled: enabled }),
}))
