import React from 'react';
import { WebContainer } from '@webcontainer/api';
interface WebContainerContextType {
    instance: WebContainer | null;
    isLoading: boolean;
    error: Error | null;
}
export declare const useWebContainer: () => WebContainerContextType;
export declare const WebContainerProvider: React.FC<{
    children: React.ReactNode;
}>;
export {};
