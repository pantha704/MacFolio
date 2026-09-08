export interface WindowRect { left: number; top: number; width: number; height: number }
export const windowBounds = (width: number, height: number) => ({ left: 12, top: 56, width: Math.max(0, width - 24), height: Math.max(0, height - 160) })
export function clampWindow(rect: WindowRect, viewportWidth: number, viewportHeight: number): WindowRect {
  const bounds = windowBounds(viewportWidth, viewportHeight)
  const width = Math.min(Math.max(320, rect.width), bounds.width)
  const height = Math.min(Math.max(240, rect.height), bounds.height)
  return { width, height, left: Math.max(bounds.left, Math.min(rect.left, bounds.left + bounds.width - width)), top: Math.max(bounds.top, Math.min(rect.top, bounds.top + bounds.height - height)) }
}
