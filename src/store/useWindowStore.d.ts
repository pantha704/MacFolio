import { WINDOW_CONFIG } from "#constants";
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
export declare const useWindowStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<WindowState>, "setState"> & {
    setState(nextStateOrUpdater: WindowState | Partial<WindowState> | ((state: import("immer").WritableDraft<WindowState>) => void), shouldReplace?: false): void;
    setState(nextStateOrUpdater: WindowState | ((state: import("immer").WritableDraft<WindowState>) => void), shouldReplace: true): void;
}>;
export {};
