import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createGame,
  emptyInput,
  fixedStepper,
  stepGame,
  flipperSegment,
} from '../src/arcade/engine.ts'
test('all games remain stationary until explicitly started and while paused', () => {
  for (const game of ['pinball', 'pong', 'racer'])
    for (const phase of ['ready', 'paused', 'over']) {
      const s = createGame(game)
      s.phase = phase
      const before = structuredClone(s)
      stepGame(s, { ...emptyInput(), left: true, boost: true }, 1 / 120)
      assert.deepEqual(s, before)
    }
})
test('physics are deterministic at 30, 60 and 120 display frames per second', () => {
  for (const game of ['pinball', 'pong', 'racer']) {
    const run = (fps) => {
      const state = createGame(game)
      state.phase = 'playing'
      const clock = fixedStepper()
      for (let i = 0; i < fps * 12; i++)
        clock.advance(1 / fps, (dt) =>
          stepGame(state, { ...emptyInput(), left: true, right: true }, dt),
        )
      return state
    }
    assert.deepEqual(run(30), run(60))
    assert.deepEqual(run(60), run(120))
  }
})
test('a stalled frame cannot advance more than 100ms of gameplay', () => {
  let elapsed = 0
  const clock = fixedStepper()
  clock.advance(10, (dt) => (elapsed += dt))
  assert.ok(elapsed <= 0.100001)
  assert.ok(elapsed > 0.09)
  clock.reset()
  clock.advance(NaN, () => assert.fail())
  clock.advance(-1, () => assert.fail())
})
test('pinball scores real bumper impacts and separates the ball from the bumper', () => {
  const s = createGame('pinball')
  s.phase = 'playing'
  s.cooldown = 0
  s.ball = { x: 0, z: -1.1, vx: 0, vz: 5 }
  stepGame(s, emptyInput(), 1 / 120)
  assert.equal(s.score, 25)
  assert.ok(s.ball.vz < 0)
  assert.ok(s.ball.z < -1.2)
})
test('flippers have mirrored geometry and lift toward the bumpers', () => {
  for (const a of [0, 0.5, 1]) {
    const l = flipperSegment(0, a),
      r = flipperSegment(1, a)
    assert.equal(l.endX, -r.endX)
    assert.equal(l.endZ, r.endZ)
  }
  assert.ok(flipperSegment(0, 1).endZ < flipperSegment(0, 0).endZ)
})
test('pong returns score once, accelerate, and go back up the court', () => {
  const s = createGame('pong')
  s.phase = 'playing'
  s.cooldown = 0
  s.ball = { x: 0.3, z: 5.34, vx: 0, vz: 8 }
  stepGame(s, emptyInput(), 1 / 120)
  assert.equal(s.score, 10)
  assert.ok(s.ball.vz < 0)
  stepGame(s, emptyInput(), 1 / 120)
  assert.equal(s.score, 10)
})
test('each missed ball consumes exactly one life and ends the run after three', () => {
  for (const game of ['pinball', 'pong']) {
    const s = createGame(game)
    s.phase = 'playing'
    for (let i = 2; i >= 0; i--) {
      s.cooldown = 0
      s.ball = { x: 0, z: 7.2, vx: 0, vz: 4 }
      stepGame(s, emptyInput(), 1 / 120)
      assert.equal(s.lives, i)
    }
    assert.equal(s.phase, 'over')
  }
})
test('racer distance increases, boost drains, braking slows, and steering stays on road', () => {
  const run = (input) => {
    const s = createGame('racer')
    s.phase = 'playing'
    for (let i = 0; i < 360; i++) stepGame(s, input, 1 / 120)
    return s
  }
  const plain = run(emptyInput()),
    boost = run({ ...emptyInput(), boost: true }),
    brake = run({ ...emptyInput(), brake: true }),
    left = run({ ...emptyInput(), left: true })
  assert.ok(plain.score > 50)
  assert.ok(boost.distance > plain.distance)
  assert.ok(boost.energy < 100)
  assert.ok(brake.distance < plain.distance)
  assert.equal(left.player, -3.35)
})
test('racer collision immunity prevents losing all lives in one impact', () => {
  const s = createGame('racer')
  s.phase = 'playing'
  s.traffic[0] = { x: 0, z: 3, speed: 0 }
  stepGame(s, emptyInput(), 1 / 120)
  assert.equal(s.lives, 2)
  for (let i = 0; i < 60; i++) stepGame(s, emptyInput(), 1 / 120)
  assert.equal(s.lives, 2)
})
test('long games keep every coordinate finite and life count valid', () => {
  for (const game of ['pinball', 'pong', 'racer']) {
    const s = createGame(game)
    s.phase = 'playing'
    for (let i = 0; i < 120 * 120; i++) {
      stepGame(
        s,
        {
          left: i % 180 < 90,
          right: i % 240 < 120,
          boost: i % 360 < 120,
          brake: false,
        },
        1 / 120,
      )
      assert.ok(
        [
          s.ball.x,
          s.ball.z,
          s.ball.vx,
          s.ball.vz,
          s.player,
          s.speed,
          s.energy,
        ].every(Number.isFinite),
      )
      assert.ok(s.lives >= 0 && s.lives <= 3)
    }
  }
})
