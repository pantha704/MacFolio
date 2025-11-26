import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';

interface WebContainerContextType {
  instance: WebContainer | null;
  isLoading: boolean;
  error: Error | null;
}

const WebContainerContext = createContext<WebContainerContextType | null>(null);

export const useWebContainer = () => {
  const context = useContext(WebContainerContext);
  if (!context) {
    throw new Error('useWebContainer must be used within a WebContainerProvider');
  }
  return context;
};

export const WebContainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const bootingRef = useRef(false);

  useEffect(() => {
    async function boot() {
      if (bootingRef.current || instance) return;

      bootingRef.current = true;
      try {
        const webcontainer = await WebContainer.boot();
        setInstance(webcontainer);
      } catch (err) {
        console.error('Failed to boot WebContainer:', err);
        setError(err instanceof Error ? err : new Error('Failed to boot WebContainer'));
      } finally {
        setIsLoading(false);
      }
    }

    boot();
  }, []);

  return (
    <WebContainerContext.Provider value={{ instance, isLoading, error }}>
      {children}
    </WebContainerContext.Provider>
  );
};
