export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type SeasonMode = 'auto' | Season
export const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}
const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x))
  return t * t * (3 - 2 * t)
}

/** A distant meteor appears as a straight, fast atmospheric track, not a falling snowflake.
 * Coordinates use viewport-height units so widening the screen cannot stretch its angle.
 * The head moves at constant angular speed; the luminous wake grows, tapers and fades.
 */
export function meteorAt(time: number, aspect = 1) {
  if (
    !Number.isFinite(time) ||
    time < 0 ||
    !Number.isFinite(aspect) ||
    aspect <= 0
  )
    return null
  const slot = Math.floor(time / 12),
    seed = slot + 42,
    delay = 2 + random(seed) * 4
  const duration = 0.85 + random(seed + 1) * 0.55,
    age = time - slot * 12 - delay
  if (age < 0 || age > duration) return null
  const x = (random(seed + 2) * 0.64 - 0.36) * aspect,
    y = 0.82 + random(seed + 3) * 0.15
  const vx = 0.46 + random(seed + 4) * 0.24,
    vy = -(0.2 + random(seed + 5) * 0.16)
  const wake = Math.min(age, 0.24)
  return {
    head: [x + vx * age, y + vy * age],
    tail: [x + vx * (age - wake), y + vy * (age - wake)],
    opacity:
      smooth(age / 0.1) *
      (1 - smooth((age - duration * 0.58) / (duration * 0.42))),
    age,
    duration,
  }
}

export function particleSeeds(count: number) {
  const values = new Float32Array(count * 4)
  for (let i = 0; i < values.length; i++) values[i] = random(i + 19)
  return values
}

/** Analytic drift: bounded coordinates, off-screen wrapping, no accumulated integration error. */
export function driftAt(seed: readonly number[], time: number) {
  const depth = seed[2],
    speed = 0.013 + depth * 0.023
  const wrap = (n: number) => n - Math.floor(n)
  const x =
    wrap(seed[0] + time * (0.006 + depth * 0.009)) * 1.3 -
    0.15 +
    Math.sin(time * 0.45 + seed[3] * 20) * 0.028
  const y =
    1.15 -
    wrap(seed[1] + time * speed) * 1.3 +
    Math.sin(time * 0.7 + seed[3] * 30) * 0.008
  return {
    x,
    y,
    angle:
      Math.sin(time * 0.9 + seed[3] * 15) * 0.7 + time * (seed[3] - 0.5) * 0.75,
    size: 7 + depth * 17,
    opacity: 0.22 + depth * 0.42,
  }
}
