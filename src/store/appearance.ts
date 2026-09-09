import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../utils/storage'
import type { Phase } from '../utils/ambience'
type Preferences = { mode: 'auto' | 'rotate' | 'photo' | Phase; motion: boolean; seasonal: boolean; south: boolean }
const defaults: Preferences = { mode: 'auto', motion: true, seasonal: false, south: false }
export const useAppearance = create<Preferences & { update: (p: Partial<Preferences>) => void }>()(persist(set => ({ ...defaults, update: p => set(p) }), { name: 'macfolio-appearance', storage: createJSONStorage(() => safeStorage), merge: (value, state) => { const p = value as Partial<Preferences> | null; return { ...state, mode: ['auto','rotate','photo','dawn','day','evening','night'].includes(p?.mode ?? '') ? p!.mode! : defaults.mode, motion: typeof p?.motion === 'boolean' ? p.motion : true, seasonal: p?.seasonal === true, south: p?.south === true } } }))
