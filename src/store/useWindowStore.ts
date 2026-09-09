import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { INITIAL_Z_INDEX, WINDOW_CONFIG } from '#constants'

type WindowConfigType = typeof WINDOW_CONFIG
export type WindowKey = keyof WindowConfigType

export type WindowItem = {
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  data: unknown
}

type WindowState = {
  windows: Record<WindowKey, WindowItem>
  order: WindowKey[]
  focusedWindow: WindowKey | null
  nextZIndex: number
  showDesktopSnapshot: WindowKey[]
  openWindow: (key: WindowKey, data?: unknown) => void
  closeWindow: (key: WindowKey) => void
  minimizeWindow: (key: WindowKey) => void
  maximizeWindow: (key: WindowKey) => void
  restoreWindow: (key: WindowKey) => void
  focusWindow: (key: WindowKey) => void
  activateWindow: (key: WindowKey, data?: unknown) => void
  launchFromDock: (key: WindowKey) => void
  toggleShowDesktop: () => void
  toggleWindow: (key: WindowKey) => void
  updateWindowData: (key: WindowKey, data: unknown) => void
  updateWindowZIndex: (key: WindowKey) => void
}

const initialWindows = Object.entries(WINDOW_CONFIG).reduce((all, [key, config]) => {
  all[key as WindowKey] = {
    ...config,
    isOpen: config.isOpen ?? false,
    isMinimized: false,
    isMaximized: false,
    zIndex: config.zIndex ?? INITIAL_Z_INDEX,
    data: config.data ?? null,
  }
  return all
}, {} as Record<WindowKey, WindowItem>)

function normalize(state: WindowState) {
  state.order = state.order.filter((key, index, keys) => state.windows[key].isOpen && keys.indexOf(key) === index)
  state.order.forEach((key, index) => { state.windows[key].zIndex = INITIAL_Z_INDEX + index + 1 })
  state.nextZIndex = INITIAL_Z_INDEX + state.order.length + 1
  if (state.focusedWindow && (!state.windows[state.focusedWindow].isOpen || state.windows[state.focusedWindow].isMinimized)) state.focusedWindow = null
  if (!state.focusedWindow) state.focusedWindow = [...state.order].reverse().find(key => !state.windows[key].isMinimized) ?? null
}

function bringToFront(state: WindowState, key: WindowKey) {
  state.order = state.order.filter(item => item !== key)
  state.order.push(key)
  state.focusedWindow = key
  state.showDesktopSnapshot = []
  normalize(state)
}

export const useWindowStore = create<WindowState>()(immer(set => ({
  windows: initialWindows,
  order: [],
  focusedWindow: null,
  nextZIndex: INITIAL_Z_INDEX + 1,
  showDesktopSnapshot: [],
  openWindow: (key, data) => set(state => {
    const win = state.windows[key]
    win.isOpen = true
    win.isMinimized = false
    if (data !== undefined) win.data = data
    bringToFront(state, key)
  }),
  closeWindow: key => set(state => {
    const win = state.windows[key]
    Object.assign(win, { isOpen: false, isMinimized: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null })
    state.order = state.order.filter(item => item !== key)
    if (state.focusedWindow === key) state.focusedWindow = null
    normalize(state)
  }),
  minimizeWindow: key => set(state => {
    const win = state.windows[key]
    if (!win.isOpen) return
    win.isMinimized = true
    if (state.focusedWindow === key) state.focusedWindow = null
    normalize(state)
  }),
  maximizeWindow: key => set(state => {
    const win = state.windows[key]
    if (!win.isOpen) return
    win.isMaximized = !win.isMaximized
    win.isMinimized = false
    bringToFront(state, key)
  }),
  restoreWindow: key => set(state => {
    const win = state.windows[key]
    win.isOpen = true
    win.isMinimized = false
    bringToFront(state, key)
  }),
  focusWindow: key => set(state => {
    const win = state.windows[key]
    if (!win.isOpen) return
    win.isMinimized = false
    bringToFront(state, key)
  }),
  activateWindow: (key, data) => set(state => {
    const win = state.windows[key]
    win.isOpen = true
    win.isMinimized = false
    if (data !== undefined) win.data = data
    bringToFront(state, key)
  }),
  launchFromDock: key => set(state => {
    const win = state.windows[key]
    if (!win.isOpen || win.isMinimized || state.focusedWindow !== key) {
      win.isOpen = true
      win.isMinimized = false
      bringToFront(state, key)
      return
    }
    win.isMinimized = true
    state.focusedWindow = null
    normalize(state)
  }),
  toggleShowDesktop: () => set(state => {
    const visible = state.order.filter(key => state.windows[key].isOpen && !state.windows[key].isMinimized)
    if (visible.length) {
      state.showDesktopSnapshot = visible
      visible.forEach(key => { state.windows[key].isMinimized = true })
      state.focusedWindow = null
    } else if (state.showDesktopSnapshot.length) {
      const snapshot = state.showDesktopSnapshot.filter(key => state.windows[key].isOpen)
      snapshot.forEach(key => { state.windows[key].isMinimized = false })
      state.focusedWindow = snapshot.at(-1) ?? null
      state.showDesktopSnapshot = []
    }
    normalize(state)
  }),
  toggleWindow: key => set(state => {
    const win = state.windows[key]
    if (win.isOpen && !win.isMinimized && state.focusedWindow === key) {
      win.isMinimized = true
      state.focusedWindow = null
      normalize(state)
      return
    }
    win.isOpen = true
    win.isMinimized = false
    bringToFront(state, key)
  }),
  updateWindowData: (key, data) => set(state => { state.windows[key].data = data }),
  updateWindowZIndex: key => set(state => { if (state.windows[key].isOpen) bringToFront(state, key) }),
})))
