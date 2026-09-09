import { WINDOW_CONFIG } from "#constants";
type WindowConfigType = typeof WINDOW_CONFIG;
export type WindowKey = keyof WindowConfigType;
interface WindowItem {
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    data: unknown;
}
interface WindowState {
    windows: Record<WindowKey, WindowItem>;
    order: WindowKey[];
    focusedWindow: WindowKey | null;
    nextZIndex: number;
    showDesktopSnapshot: WindowKey[];
    openWindow: (windowKey: WindowKey, data?: unknown) => void;
    closeWindow: (windowKey: WindowKey) => void;
    minimizeWindow: (windowKey: WindowKey) => void;
    maximizeWindow: (windowKey: WindowKey) => void;
    restoreWindow: (windowKey: WindowKey) => void;
    focusWindow: (windowKey: WindowKey) => void;
    activateWindow: (windowKey: WindowKey, data?: unknown) => void;
    launchFromDock: (windowKey: WindowKey) => void;
    toggleShowDesktop: () => void;
    toggleWindow: (windowKey: WindowKey) => void;
    updateWindowData: (windowKey: WindowKey, data: unknown) => void;
    updateWindowZIndex: (windowKey: WindowKey) => void;
}
export declare const useWindowStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<WindowState>, "setState"> & {
    setState(nextStateOrUpdater: WindowState | Partial<WindowState> | ((state: import("immer").WritableDraft<WindowState>) => void), shouldReplace?: false): void;
    setState(nextStateOrUpdater: WindowState | ((state: import("immer").WritableDraft<WindowState>) => void), shouldReplace: true): void;
}>;
export {};
