import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { WebContainer } from '@webcontainer/api'

export type RuntimePhase = 'checking' | 'booting' | 'still-starting' | 'ready' | 'unsupported' | 'failed'
type RuntimeState = { instance: WebContainer | null; phase: RuntimePhase; error: Error | null; elapsed: number }
type WebContainerContextType = RuntimeState & { retry: () => void }

const Context = createContext<WebContainerContextType | null>(null)
let bootPromise: Promise<WebContainer> | null = null
let bootedInstance: WebContainer | null = null

function beginBoot(): Promise<WebContainer> {
  if (bootedInstance) return Promise.resolve(bootedInstance)
  if (!bootPromise) {
    bootPromise = (async () => {
      if (!window.isSecureContext) throw new Error('The Node runtime needs a secure HTTPS connection.')
      if (!window.crossOriginIsolated) throw new Error('This page is not cross-origin isolated. Browser privacy settings or deployment headers may be blocking the Node runtime.')
      const { WebContainer } = await import('@webcontainer/api')
      const instance = await WebContainer.boot()
      bootedInstance = instance
      return instance
    })().catch(error => {
      bootPromise = null
      throw error
    })
  }
  return bootPromise
}

export function useWebContainer() {
  const context = useContext(Context)
  if (!context) throw new Error('Missing WebContainerProvider')
  return context
}

export function WebContainerProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<RuntimeState>(() => {
    const unsupported = !window.isSecureContext || !window.crossOriginIsolated
    return { instance: bootedInstance, phase: bootedInstance ? 'ready' : unsupported ? 'unsupported' : 'booting', error: null, elapsed: 0 }
  })
  const attemptId = useRef(0)
  const retry = useCallback(() => {
    const unsupported = !window.isSecureContext || !window.crossOriginIsolated
    setState({ instance: bootedInstance, phase: bootedInstance ? 'ready' : unsupported ? 'unsupported' : 'booting', error: null, elapsed: 0 })
    setAttempt(value => value + 1)
  }, [])

  useEffect(() => {
    let active = true
    const id = ++attemptId.current
    const started = performance.now()
    const unsupported = !window.isSecureContext || !window.crossOriginIsolated
    const elapsedTimer = window.setInterval(() => {
      if (!active || bootedInstance) return
      const elapsed = Math.round((performance.now() - started) / 1000)
      setState(current => ({ ...current, phase: elapsed >= 60 ? 'still-starting' : current.phase, elapsed }))
    }, 1000)
    void beginBoot().then(instance => {
      if (active && attemptId.current === id) setState({ instance, phase: 'ready', error: null, elapsed: Math.round((performance.now() - started) / 1000) })
    }, error => {
      if (active && attemptId.current === id) setState({ instance: null, phase: unsupported ? 'unsupported' : 'failed', error: error instanceof Error ? error : new Error('The Node runtime could not start.'), elapsed: Math.round((performance.now() - started) / 1000) })
    }).finally(() => clearInterval(elapsedTimer))
    return () => { active = false; clearInterval(elapsedTimer) }
  }, [attempt])

  return <Context.Provider value={{ ...state, retry }}>{children}</Context.Provider>
}
