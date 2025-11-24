import { create } from "zustand";
import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";

type WindowConfigType = typeof WINDOW_CONFIG;
type WindowKey = keyof WindowConfigType;

interface WindowState {
  windows: WindowConfigType;
  toggleWindow: (id: WindowKey) => void;
  bringToFront: (id: WindowKey) => void;
}

export const useWindowStore = create<WindowState>((set) => ({
  windows: WINDOW_CONFIG,

  toggleWindow: (id) =>
    set((state) => {
      const isOpen = !state.windows[id].isOpen;
      const maxZIndex = Math.max(
        ...Object.values(state.windows).map((w) => w.zIndex),
        INITIAL_Z_INDEX
      );

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            isOpen,
            zIndex: isOpen ? maxZIndex + 1 : state.windows[id].zIndex,
          },
        },
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      const maxZIndex = Math.max(
        ...Object.values(state.windows).map((w) => w.zIndex),
        INITIAL_Z_INDEX
      );

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...state.windows[id],
            zIndex: maxZIndex + 1,
          },
        },
      };
    }),
}));
