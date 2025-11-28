import { create } from "zustand";
import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { immer } from "zustand/middleware/immer";

type WindowConfigType = typeof WINDOW_CONFIG;
export type WindowKey = keyof WindowConfigType;

interface WindowItem {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data: any;
}

interface WindowState {
  windows: Record<WindowKey, WindowItem>;
  nextZIndex: number;
  openWindow: (windowKey: WindowKey, data?: any) => void;
  closeWindow: (windowKey: WindowKey) => void;
  minimizeWindow: (windowKey: WindowKey) => void;
  maximizeWindow: (windowKey: WindowKey) => void;
  restoreWindow: (windowKey: WindowKey) => void;
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
        isMinimized: false,
        isMaximized: false,
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
          win.isMinimized = false;
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
          win.isMinimized = false;
          win.isMaximized = false;
          win.data = null;
          win.zIndex = INITIAL_Z_INDEX;
        }
      }),

    minimizeWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.isMinimized = true;
        }
      }),

    maximizeWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.isMaximized = !win.isMaximized;
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),

    restoreWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          win.isMinimized = false;
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),

    focusWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          if (win.isMinimized) win.isMinimized = false;
          win.zIndex = state.nextZIndex;
          state.nextZIndex++;
        }
      }),

    toggleWindow: (windowKey: WindowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (win) {
          if (win.isOpen && !win.isMinimized) {
             // If open and visible, check if it's the top-most window
             // logic handled in Dock.tsx usually, but here basic toggle:
             // For now, keep basic toggle logic or update to match desired behavior?
             // The user asked for specific Dock behavior:
             // "click again on it, that would only minimize the app"
             // "if i press the 3rd time it will open from where it left"

             // We'll leave this basic toggle as "Open/Close" for now,
             // and implement the sophisticated logic in Dock.tsx using the new actions.
             // Actually, let's make this toggle smart:
             // If minimized -> Restore
             // If Open -> Close (default behavior) - BUT user wants Minimize.
             // Let's keep this simple and handle the complex logic in Dock.tsx

             const opening = !win.isOpen;
             win.isOpen = opening;
             if (opening) {
                win.zIndex = state.nextZIndex;
                state.nextZIndex++;
                win.isMinimized = false;
             } else {
                win.zIndex = INITIAL_Z_INDEX;
                win.data = null;
                win.isMinimized = false;
                win.isMaximized = false;
             }
          } else if (win.isMinimized) {
             win.isMinimized = false;
             win.zIndex = state.nextZIndex;
             state.nextZIndex++;
          } else {
             win.isOpen = true;
             win.zIndex = state.nextZIndex;
             state.nextZIndex++;
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