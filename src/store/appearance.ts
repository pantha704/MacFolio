import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../utils/storage'
import type { Phase } from '../utils/ambience'
import type { SceneId } from '../wallpapers/manifest'

export type Hemisphere = 'north' | 'south'
export type AppearancePreferences = {
  scene: SceneId
  time: 'auto' | 'manual'
  manualPhase: Phase
  motion: 'still' | 'subtle'
  seasonal: boolean
  hemisphere: Hemisphere
  lowData: boolean
}

const defaults: AppearancePreferences = { scene: 'landscape', time: 'auto', manualPhase: 'day', motion: 'subtle', seasonal: true, hemisphere: 'north', lowData: false }
const scenes: SceneId[] = ['landscape', 'abstract', 'slideshow', 'photo']
const phases: Phase[] = ['dawn', 'day', 'evening', 'night']

type AppearanceStore = AppearancePreferences & { update: (value: Partial<AppearancePreferences>) => void; reset: () => void }
export const useAppearance = create<AppearanceStore>()(persist(set => ({
  ...defaults,
  update: value => set(value),
  reset: () => set(defaults),
}), {
  name: 'macfolio-appearance',
  version: 2,
  storage: createJSONStorage(() => safeStorage),
  migrate: (persisted: unknown) => {
    const value = (persisted ?? {}) as Record<string, unknown>
    if ('mode' in value) {
      const oldMode = value.mode
      return {
        ...defaults,
        scene: oldMode === 'photo' ? 'photo' : oldMode === 'rotate' ? 'slideshow' : 'landscape',
        time: phases.includes(oldMode as Phase) ? 'manual' : 'auto',
        manualPhase: phases.includes(oldMode as Phase) ? oldMode as Phase : 'day',
        motion: value.motion === false ? 'still' : 'subtle',
        seasonal: value.seasonal === true,
        hemisphere: value.south === true ? 'south' : 'north',
      } satisfies AppearancePreferences
    }
    return value
  },
  merge: (persisted, current) => {
    const value = (persisted ?? {}) as Partial<AppearancePreferences>
    return {
      ...current,
      scene: scenes.includes(value.scene as SceneId) ? value.scene! : defaults.scene,
      time: value.time === 'manual' ? 'manual' : 'auto',
      manualPhase: phases.includes(value.manualPhase as Phase) ? value.manualPhase! : defaults.manualPhase,
      motion: value.motion === 'still' ? 'still' : 'subtle',
      seasonal: typeof value.seasonal === 'boolean' ? value.seasonal : defaults.seasonal,
      hemisphere: value.hemisphere === 'south' ? 'south' : 'north',
      lowData: value.lowData === true,
    }
  },
}))
