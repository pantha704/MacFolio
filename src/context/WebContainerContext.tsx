import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { WebContainer } from '@webcontainer/api'

interface WebContainerContextType { instance: WebContainer | null; isLoading: boolean; error: Error | null }
const Context = createContext<WebContainerContextType | null>(null)
let bootPromise: Promise<WebContainer> | null = null
export function useWebContainer() { const context = useContext(Context); if (!context) throw new Error('Missing WebContainerProvider'); return context }
export function WebContainerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WebContainerContextType>({ instance: null, isLoading: true, error: null })
  useEffect(() => {
    let cancelled = false
    // One boot per page, including StrictMode remounts. Imported only after opening Terminal.
    if (!bootPromise) bootPromise = (async () => {
      if (!window.crossOriginIsolated) throw new Error('This browser cannot start the interactive shell.')
      const { WebContainer } = await import('@webcontainer/api')
      return WebContainer.boot()
    })().catch(error => { bootPromise = null; throw error })
    const timer = setTimeout(() => { if (!cancelled) { cancelled = true; setState({ instance: null, isLoading: false, error: new Error('The Node runtime did not respond. Switch back to Portfolio commands, or reload to retry.') }) } }, 15000)
    bootPromise.then(instance => { clearTimeout(timer); if (!cancelled) setState({ instance, isLoading: false, error: null }) }, error => { clearTimeout(timer); if (!cancelled) setState({ instance: null, isLoading: false, error: error instanceof Error ? error : new Error('The shell could not start.') }) })
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}
