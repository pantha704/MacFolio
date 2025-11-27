import React from 'react';
import { WindowKey } from '#store/useWindowStore';
declare const WindowWrapper: (Component: React.ComponentType<Record<string, unknown>>, windowKey: WindowKey) => {
    (props: Record<string, unknown>): import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
export default WindowWrapper;
