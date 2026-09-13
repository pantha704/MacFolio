import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../utils/storage'
import type { Phase } from '../utils/ambience'
import type { SceneId } from '../wallpapers/manifest'
import { phaseHours } from '../utils/daylight'
import { seasons, type SeasonMode } from '../wallpapers/atmosphere'

export type Hemisphere = 'north' | 'south'
export type AppearancePreferences = {
  scene: SceneId
  time: 'auto' | 'manual'
  manualPhase: Phase
  manualHour: number
  motion: 'still' | 'subtle'
  seasonal: boolean
  atmosphere: boolean
  seasonMode: SeasonMode
  hemisphere: Hemisphere
  lowData: boolean
  flipHorizontal: boolean
}

const defaults: AppearancePreferences = {
  scene: 'living',
  time: 'auto',
  manualPhase: 'day',
  manualHour: 12,
  motion: 'subtle',
  seasonal: false,
  atmosphere: true,
  seasonMode: 'auto',
  hemisphere: 'north',
  lowData: false,
  flipHorizontal: true,
}
const scenes: SceneId[] = [
  'living',
  'landscape',
  'abstract',
  'slideshow',
  'photo',
]
const phases: Phase[] = ['dawn', 'day', 'evening', 'night']

type AppearanceStore = AppearancePreferences & {
  update: (value: Partial<AppearancePreferences>) => void
  reset: () => void
}
export const useAppearance = create<AppearanceStore>()(
  persist(
    (set) => ({
      ...defaults,
      update: (value) =>
        set({
          ...value,
          ...(value.manualPhase
            ? { manualHour: phaseHours[value.manualPhase] }
            : {}),
        }),
      reset: () => set(defaults),
    }),
    {
      name: 'macfolio-appearance',
      version: 5,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persisted: unknown, version) => {
        const value = (persisted ?? {}) as Record<string, unknown>
        if ('mode' in value) {
          const oldMode = value.mode
          return {
            ...defaults,
            scene:
              oldMode === 'photo'
                ? 'photo'
                : oldMode === 'rotate'
                  ? 'slideshow'
                  : 'living',
            time: phases.includes(oldMode as Phase) ? 'manual' : 'auto',
            manualPhase: phases.includes(oldMode as Phase)
              ? (oldMode as Phase)
              : 'day',
            manualHour: phases.includes(oldMode as Phase)
              ? phaseHours[oldMode as Phase]
              : 12,
            motion: value.motion === false ? 'still' : 'subtle',
            seasonal: value.seasonal === true,
            hemisphere: value.south === true ? 'south' : 'north',
          } satisfies AppearancePreferences
        }
        return {
          ...value,
          scene:
            version < 4 && value.scene === 'landscape' ? 'living' : value.scene,
        }
      },
      merge: (persisted, current) => {
        const value = (persisted ?? {}) as Partial<AppearancePreferences>
        return {
          ...current,
          scene: scenes.includes(value.scene as SceneId)
            ? value.scene!
            : defaults.scene,
          time: value.time === 'manual' ? 'manual' : 'auto',
          manualPhase: phases.includes(value.manualPhase as Phase)
            ? value.manualPhase!
            : defaults.manualPhase,
          manualHour:
            typeof value.manualHour === 'number' &&
            Number.isFinite(value.manualHour)
              ? Math.max(0, Math.min(23.99, value.manualHour))
              : phaseHours[
                  phases.includes(value.manualPhase as Phase)
                    ? value.manualPhase!
                    : 'day'
                ],
          motion: value.motion === 'still' ? 'still' : 'subtle',
          seasonal:
            typeof value.seasonal === 'boolean'
              ? value.seasonal
              : defaults.seasonal,
          atmosphere:
            typeof value.atmosphere === 'boolean'
              ? value.atmosphere
              : defaults.atmosphere,
          seasonMode: seasons.includes(
            value.seasonMode as (typeof seasons)[number],
          )
            ? value.seasonMode!
            : 'auto',
          hemisphere: value.hemisphere === 'south' ? 'south' : 'north',
          lowData: value.lowData === true,
          flipHorizontal:
            typeof value.flipHorizontal === 'boolean'
              ? value.flipHorizontal
              : defaults.flipHorizontal,
        }
      },
    },
  ),
)
