export function safeSave(key: string, value: string): boolean {
  try { localStorage.setItem(key, value); return true } catch { return false }
}
export function readFavorites(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem('gallery_favorites') ?? '[]'); return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : [] } catch { return [] }
}
export const safeStorage = {
  getItem(name: string) { try { return localStorage.getItem(name) } catch { return null } },
  setItem(name: string, value: string) { safeSave(name, value) },
  removeItem(name: string) { try { localStorage.removeItem(name) } catch { /* Keep in-memory preferences. */ } },
}
