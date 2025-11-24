import { WINDOW_CONFIG } from "#constants";
type WindowConfigType = typeof WINDOW_CONFIG;
type WindowKey = keyof WindowConfigType;
interface WindowState {
    windows: WindowConfigType;
    toggleWindow: (id: WindowKey) => void;
    bringToFront: (id: WindowKey) => void;
}
export declare const useWindowStore: import("zustand").UseBoundStore<import("zustand").StoreApi<WindowState>>;
export {};
