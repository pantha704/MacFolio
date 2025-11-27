import { create } from "zustand";
import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { immer } from "zustand/middleware/immer";

type WindowConfigType = typeof WINDOW_CONFIG;
export type WindowKey = keyof WindowConfigType;

interface WindowItem {
  isOpen: boolean;
  zIndex: number;
  data: any;
}

interface WindowState {
  windows: Record<WindowKey, WindowItem>;
  nextZIndex: number;
  openWindow: (windowKey: WindowKey, data?: any) => void;
  closeWindow: (windowKey: WindowKey) => void;
  focusWindow: (windowKey: WindowKey) => void;
  toggleWindow: (windowKey: WindowKey) => void;
  updateWindowData: (windowKey: WindowKey, data: any) => void;
  updateWindowZIndex: (windowKey: WindowKey) => void;
}

export const useWindowStore = create<WindowState>()(
  immer((set) => ({
    windows: Object.entries(WINDOW_CONFIG).reduce((acc, [key, config]) => {
      acc[key as WindowKey] = {
        ...config,
        isOpen: config.isOpen ?? false,
        zIndex: config.zIndex ?? INITIAL_Z_INDEX,
        data: config.data ?? null,
      };
      return acc;
    }, {} as Record<WindowKey, WindowItem>),
    nextZIndex: INITIAL_Z_INDEX + 1,

    openWindow: (windowKey: WindowKey, data: any = null) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.isOpen = true;
          win.data = data ?? win.data;
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),

    closeWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.isOpen = false;
          win.data = null;
          win.zIndex = INITIAL_Z_INDEX;
        }
      }),

    focusWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),

    toggleWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          const opening = !win.isOpen;
          win.isOpen = opening;
          if (opening) {
            win.zIndex = state.nextZIndex;
            state.nextZIndex++;
          } else {
            win.zIndex = INITIAL_Z_INDEX;
            win.data = null;
          }
        }
      }),

    updateWindowData: (windowKey: WindowKey, data) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.data = data;
        }
      }),

    updateWindowZIndex: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),
  }))
);