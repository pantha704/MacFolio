interface SystemState {
    isWifiEnabled: boolean;
    toggleWifi: () => void;
    setWifi: (enabled: boolean) => void;
    wallpaper: string;
    setWallpaper: (url: string) => void;
    galleryImages: string[];
    setGalleryImages: (images: string[]) => void;
    addGalleryImage: (url: string) => void;
}
export declare const useSystemStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<SystemState>, "setState" | "persist"> & {
    setState(partial: SystemState | Partial<SystemState> | ((state: SystemState) => SystemState | Partial<SystemState>), replace?: false | undefined): unknown;
    setState(state: SystemState | ((state: SystemState) => SystemState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<SystemState, SystemState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: SystemState) => void) => () => void;
        onFinishHydration: (fn: (state: SystemState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<SystemState, SystemState, unknown>>;
    };
}>;
export {};
