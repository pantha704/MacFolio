import React from 'react';
import { WindowKey } from '#store/useWindowStore';
declare const WindowWrapper: (Component: React.ComponentType<any>, windowKey: WindowKey) => {
    (props: any): import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
export default WindowWrapper;
