export const phaseHours = { dawn: 6.5, day: 12, evening: 18, night: 23 }
// Artistic local-clock lighting, independent of location permission.
const keys = [
  [0, 0.015, 0.035, 0.09, 0.12, 0.18, 0.26, 0.015, 0.05, 0.07, 0],
  [5, 0.05, 0.08, 0.19, 0.43, 0.3, 0.36, 0.06, 0.12, 0.14, 0.05],
  [7, 0.28, 0.42, 0.58, 0.96, 0.66, 0.43, 0.16, 0.27, 0.26, 0.55],
  [10, 0.22, 0.48, 0.69, 0.74, 0.85, 0.82, 0.12, 0.33, 0.31, 1],
  [15, 0.22, 0.48, 0.69, 0.74, 0.85, 0.82, 0.12, 0.33, 0.31, 1],
  [18, 0.23, 0.22, 0.4, 0.93, 0.48, 0.28, 0.13, 0.19, 0.22, 0.4],
  [20, 0.035, 0.06, 0.15, 0.22, 0.23, 0.36, 0.025, 0.07, 0.1, 0],
  [24, 0.015, 0.035, 0.09, 0.12, 0.18, 0.26, 0.015, 0.05, 0.07, 0],
]
export const localHour = (date: Date) =>
  date.getHours() +
  date.getMinutes() / 60 +
  date.getSeconds() / 3600 +
  date.getMilliseconds() / 3600000
export function daylightAt(hour: number) {
  const h = (((Number.isFinite(hour) ? hour : 12) % 24) + 24) % 24
  const index = keys.findIndex(
    (key, i) => i < keys.length - 1 && h >= key[0] && h < keys[i + 1][0],
  )
  const a = keys[index],
    b = keys[index + 1],
    t = (h - a[0]) / (b[0] - a[0]),
    s = t * t * (3 - 2 * t)
  const values = a.slice(1).map((value, i) => value + (b[i + 1] - value) * s)
  return {
    sky: values.slice(0, 3),
    horizon: values.slice(3, 6),
    land: values.slice(6, 9),
    sun: values[9],
  }
}
