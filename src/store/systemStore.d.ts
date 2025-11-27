interface SystemState {
    isWifiEnabled: boolean;
    toggleWifi: () => void;
    setWifi: (enabled: boolean) => void;
}
export declare const useSystemStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SystemState>>;
export {};
