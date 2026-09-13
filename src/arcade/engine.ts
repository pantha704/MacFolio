export type GameId = 'pinball' | 'pong' | 'racer'
export type Phase = 'ready' | 'playing' | 'paused' | 'over'
export type Input = {
  left: boolean
  right: boolean
  boost: boolean
  brake: boolean
}
export const emptyInput = (): Input => ({
  left: false,
  right: false,
  boost: false,
  brake: false,
})
export const games = {
  pinball: {
    name: 'Orbit Pinball',
    tag: 'Keep the orbit alive.',
    description: 'Three bumpers. Two flippers. One more try.',
    controls: 'A / D or ← / → · Hold each flipper independently',
  },
  pong: {
    name: 'Rally Room',
    tag: 'Find your rhythm.',
    description: 'A little patience. A perfect return.',
    controls: 'A / D or ← / → · Protect the bottom edge',
  },
  racer: {
    name: 'Nightshift',
    tag: 'Take the long way home.',
    description: 'Open road. Afterglow. Just one more kilometre.',
    controls: 'A / D or ← / → steer · Shift boosts · ↓ brakes',
  },
}
export const bumpers = [
  { x: -1.9, z: -2.5 },
  { x: 1.9, z: -2.5 },
  { x: 0, z: -0.3 },
]
type Ball = { x: number; z: number; vx: number; vz: number }
export type GameState = {
  game: GameId
  phase: Phase
  score: number
  lives: number
  elapsed: number
  cooldown: number
  ball: Ball
  player: number
  enemy: number
  flippers: [number, number]
  combo: number
  distance: number
  speed: number
  energy: number
  invulnerable: number
  seed: number
  traffic: { x: number; z: number; speed: number }[]
  lastBumper: number
}
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n))
export function createGame(game: GameId): GameState {
  return {
    game,
    phase: 'ready',
    score: 0,
    lives: 3,
    elapsed: 0,
    cooldown: 0.8,
    ball:
      game === 'pinball'
        ? { x: 2.8, z: 4.2, vx: -3, vz: -17 }
        : { x: 0, z: 0, vx: 3, vz: 8 },
    player: 0,
    enemy: 0,
    flippers: [0, 0],
    combo: 0,
    distance: 0,
    speed: 30,
    energy: 100,
    invulnerable: 0,
    seed: 42,
    traffic: Array.from({ length: 7 }, (_, i) => ({
      x: [-2.2, 0, 2.2][i % 3],
      z: -25 - i * 24,
      speed: 7 + (i % 3) * 3,
    })),
    lastBumper: -1,
  }
}
function random(state: GameState) {
  state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0
  return state.seed / 4294967296
}
function lose(state: GameState) {
  state.lives--
  state.combo = 0
  if (state.lives <= 0) {
    state.phase = 'over'
    return
  }
  state.cooldown = 1
  state.ball =
    state.game === 'pinball'
      ? { x: 2.8, z: 4.2, vx: -3, vz: -17 }
      : { x: 0, z: 0, vx: state.lives % 2 ? 3 : -3, vz: 8 }
}
export function flipperSegment(index: number, amount: number) {
  const dir = index === 0 ? 1 : -1,
    angle = 0.38 - amount * 0.85
  return {
    x: -dir * 2.55,
    z: 4.8,
    endX: -dir * 2.55 + dir * Math.cos(angle) * 2.05,
    endZ: 4.8 + Math.sin(angle) * 2.05,
  }
}
function segmentCollision(
  ball: Ball,
  a: { x: number; z: number; endX: number; endZ: number },
  radius: number,
  kick: number,
) {
  const dx = a.endX - a.x,
    dz = a.endZ - a.z,
    t = clamp(
      ((ball.x - a.x) * dx + (ball.z - a.z) * dz) / (dx * dx + dz * dz),
      0,
      1,
    )
  const x = a.x + dx * t,
    z = a.z + dz * t,
    nx = ball.x - x,
    nz = ball.z - z,
    d = Math.hypot(nx, nz)
  if (d >= radius || d < 0.0001) return
  const ux = nx / d,
    uz = nz / d,
    dot = ball.vx * ux + ball.vz * uz
  ball.x = x + ux * (radius + 0.005)
  ball.z = z + uz * (radius + 0.005)
  if (dot < 0) {
    ball.vx -= 1.82 * dot * ux
    ball.vz -= 1.82 * dot * uz
  }
  if (kick > 0 && uz < -0.1) {
    ball.vz = Math.min(ball.vz, -11 - kick * 7)
    ball.vx += ux * 4
  }
}
export function stepGame(s: GameState, input: Input, dt: number) {
  if (s.phase !== 'playing' || !Number.isFinite(dt) || dt <= 0) return
  s.elapsed += dt
  s.invulnerable = Math.max(0, s.invulnerable - dt)
  const direction = Number(input.right) - Number(input.left)
  if (s.game === 'racer') {
    const boosting = input.boost && s.energy > 1 && !input.brake
    const target = input.brake
      ? 19
      : 32 + Math.min(18, s.distance / 220) + (boosting ? 18 : 0)
    s.speed += (target - s.speed) * Math.min(1, dt * 2)
    s.energy = clamp(s.energy + (boosting ? -24 : 11) * dt, 0, 100)
    s.player = clamp(s.player + direction * 5.8 * dt, -3.35, 3.35)
    s.distance += s.speed * dt
    s.score = Math.floor(s.distance)
    for (const car of s.traffic) {
      car.z += (s.speed - car.speed) * dt
      if (car.z > 13) {
        car.z = -150 - random(s) * 30
        car.x = [-2.2, 0, 2.2][Math.floor(random(s) * 3)]
      }
      if (
        !s.invulnerable &&
        Math.abs(car.z - 3) < 1.5 &&
        Math.abs(car.x - s.player) < 0.8
      ) {
        s.lives--
        s.invulnerable = 2
        s.speed = 16
        if (s.lives <= 0) {
          s.phase = 'over'
          return
        }
      }
    }
    return
  }
  if (s.game === 'pong') {
    s.player = clamp(s.player + direction * 8 * dt, -2.7, 2.7)
    s.enemy += clamp(s.ball.x - s.enemy, -3.2 * dt, 3.2 * dt)
    s.enemy = clamp(s.enemy, -2.7, 2.7)
  } else {
    s.flippers.forEach((amount, i) => {
      const held = i === 0 ? input.left : input.right
      s.flippers[i] = clamp(amount + (held ? 12 : -8) * dt, 0, 1)
    })
  }
  if (s.cooldown > 0) {
    s.cooldown = Math.max(0, s.cooldown - dt)
    return
  }
  const b = s.ball
  if (s.game === 'pinball') {
    b.vz += 5.5 * dt
    b.vx *= Math.exp(-dt * 0.03)
  }
  b.x += b.vx * dt
  b.z += b.vz * dt
  if (Math.abs(b.x) > 3.65) {
    b.x = clamp(b.x, -3.65, 3.65)
    b.vx = -Math.sign(b.x) * Math.abs(b.vx)
  }
  if (s.game === 'pong') {
    if (
      b.vz > 0 &&
      b.z >= 5.35 &&
      b.z < 5.8 &&
      Math.abs(b.x - s.player) < 1.22
    ) {
      b.z = 5.34
      b.vz = -Math.min(16, Math.abs(b.vz) + 0.3)
      b.vx = (b.x - s.player) * 6
      s.combo++
      s.score += 10 * s.combo
    }
    if (
      b.vz < 0 &&
      b.z <= -5.35 &&
      b.z > -5.8 &&
      Math.abs(b.x - s.enemy) < 1.22
    ) {
      b.z = -5.34
      b.vz = Math.abs(b.vz)
    }
    if (b.z < -7) {
      s.score += 100
      s.ball = { x: 0, z: 0, vx: 3, vz: 8 }
      s.cooldown = 0.8
    }
    if (b.z > 7) lose(s)
    return
  }
  if (b.z < -6.35) {
    b.z = -6.35
    b.vz = Math.abs(b.vz)
  }
  bumpers.forEach((bumper, i) => {
    const dx = b.x - bumper.x,
      dz = b.z - bumper.z,
      d = Math.hypot(dx, dz)
    if (d < 0.91 && d > 0.0001) {
      b.x = bumper.x + (dx / d) * 0.92
      b.z = bumper.z + (dz / d) * 0.92
      const speed = Math.max(12, Math.hypot(b.vx, b.vz) * 1.1)
      b.vx = (dx / d) * speed
      b.vz = (dz / d) * speed
      s.score += 25
      s.lastBumper = i
    }
  })
  segmentCollision(b, { x: -3.65, z: 2, endX: -2.7, endZ: 4.5 }, 0.3, 0)
  segmentCollision(b, { x: 3.65, z: 2, endX: 2.7, endZ: 4.5 }, 0.3, 0)
  s.flippers.forEach((amount, i) =>
    segmentCollision(
      b,
      flipperSegment(i, amount),
      0.38,
      (i === 0 ? input.left : input.right) ? amount : 0,
    ),
  )
  const speed = Math.hypot(b.vx, b.vz)
  if (speed > 23) {
    b.vx *= 23 / speed
    b.vz *= 23 / speed
  }
  if (b.z > 7) lose(s)
}
export function fixedStepper() {
  let accumulator = 0
  return {
    reset() {
      accumulator = 0
    },
    advance(dt: number, step: (dt: number) => void) {
      if (!Number.isFinite(dt) || dt <= 0) return
      accumulator += Math.min(dt, 0.1)
      let count = 0
      while (accumulator >= 1 / 120 && count < 12) {
        step(1 / 120)
        accumulator -= 1 / 120
        count++
      }
    },
  }
}
