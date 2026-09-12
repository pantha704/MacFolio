import { useSyncExternalStore } from 'react'
let snapshot = Date.now()
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
function tick() {
  clearTimeout(timer)
  snapshot = Date.now()
  listeners.forEach((listener) => listener())
  if (listeners.size && !document.hidden)
    timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 10)
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    tick()
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }
}
export function useLocalClock() {
  return new Date(useSyncExternalStore(subscribe, () => snapshot))
}
