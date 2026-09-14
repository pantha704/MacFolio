import test from 'node:test'
import assert from 'node:assert/strict'
import {
  driftAt,
  meteorAt,
  particleSeeds,
} from '../src/wallpapers/atmosphere.ts'
import { seasonAt } from '../src/utils/ambience.ts'

test('meteors have a straight constant-speed head and a trailing wake', () => {
  for (const aspect of [0.45, 1, 16 / 9, 3]) {
    let previous = null
    let observations = 0
    for (let tick = 0; tick < 36000; tick++) {
      const meteor = meteorAt(tick / 100, aspect)
      if (meteor && previous && meteor.age > previous.age) {
        const dt = meteor.age - previous.age
        const vx = (meteor.head[0] - previous.head[0]) / dt
        const vy = (meteor.head[1] - previous.head[1]) / dt
        assert.ok(vx >= 0.459 && vx <= 0.701)
        assert.ok(vy <= -0.199 && vy >= -0.361)
        const dx = meteor.head[0] - meteor.tail[0]
        const dy = meteor.head[1] - meteor.tail[1]
        assert.ok(dx >= 0 && dy <= 0)
        assert.ok(Math.abs(dx * vy - dy * vx) < 1e-9)
        assert.ok(Math.hypot(dx, dy) <= Math.hypot(vx, vy) * 0.241)
        observations++
      }
      previous = meteor
    }
    assert.ok(observations > 1500)
  }
})

test('meteor events start 8–16 seconds apart, stay finite and fade at both ends', () => {
  const events = []
  const starts = []
  let event = null
  for (let tick = 0; tick < 36000; tick++) {
    const meteor = meteorAt(tick / 100, 16 / 9)
    if (meteor) {
      assert.ok(
        [...meteor.head, ...meteor.tail, meteor.opacity].every(Number.isFinite),
      )
      assert.ok(meteor.opacity >= 0 && meteor.opacity <= 1)
      if (!event) {
        event = []
        events.push(event)
        starts.push(tick / 100)
      }
      event.push(meteor)
    } else event = null
  }
  assert.equal(events.length, 30)
  for (let i = 1; i < starts.length; i++) {
    const gap = starts[i] - starts[i - 1]
    assert.ok(gap >= 7.99 && gap <= 16.01)
  }
  for (const track of events) {
    assert.ok(track.length >= 85 && track.length <= 141)
    assert.ok(track[0].opacity < 0.03)
    assert.ok(track.at(-1).opacity < 0.003)
    assert.ok(Math.max(...track.map((m) => m.opacity)) > 0.99)
  }
  assert.equal(meteorAt(NaN), null)
  assert.equal(meteorAt(-1), null)
  assert.equal(meteorAt(6, 0), null)
})

test('particle paths stay bounded over a full day and wrap outside the viewport', () => {
  const seeds = particleSeeds(72)
  assert.deepEqual(seeds, particleSeeds(72))
  for (let index = 0; index < 72; index++) {
    const seed = Array.from(seeds.slice(index * 4, index * 4 + 4))
    for (let second = 0; second <= 86400; second += 37) {
      const a = driftAt(seed, second),
        b = driftAt(seed, second + 1 / 60)
      assert.ok(Object.values(a).every(Number.isFinite))
      assert.ok(a.x >= -0.18 && a.x <= 1.18)
      assert.ok(a.y >= -0.16 && a.y <= 1.16)
      assert.ok(a.size >= 7 && a.size <= 24)
      if (Math.abs(a.x - b.x) > 1) {
        assert.ok(a.x > 1.1 && b.x < -0.1)
      } else assert.ok(Math.abs(a.x - b.x) < 0.001)
      if (Math.abs(a.y - b.y) > 1) {
        assert.ok(a.y < -0.1 && b.y > 1.1)
      } else {
        assert.ok(b.y < a.y)
        assert.ok(a.y - b.y < 0.001)
      }
    }
  }
})

test('season selection follows all calendar months in either hemisphere', () => {
  const northern = [
    'winter',
    'winter',
    'spring',
    'spring',
    'spring',
    'summer',
    'summer',
    'summer',
    'autumn',
    'autumn',
    'autumn',
    'winter',
  ]
  const opposite = {
    winter: 'summer',
    spring: 'autumn',
    summer: 'winter',
    autumn: 'spring',
  }
  northern.forEach((season, month) => {
    assert.equal(seasonAt(month, false), season)
    assert.equal(seasonAt(month, true), opposite[season])
  })
})
