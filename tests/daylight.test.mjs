import test from 'node:test'
import assert from 'node:assert/strict'
import { daylightAt, localHour } from '../src/utils/daylight.ts'
test('lighting is continuous through all keyframes, including midnight', () => {
  for (const hour of [0, 5, 7, 10, 15, 18, 20, 24]) {
    const a = daylightAt(hour - 0.00001),
      b = daylightAt(hour + 0.00001)
    for (const key of ['sky', 'horizon', 'land'])
      a[key].forEach((v, i) => assert.ok(Math.abs(v - b[key][i]) < 0.00001))
    assert.ok(Math.abs(a.sun - b.sun) < 0.00001)
  }
})
test('24-hour wrap, negative hours and invalid inputs are safe', () => {
  assert.deepEqual(daylightAt(24), daylightAt(0))
  assert.deepEqual(daylightAt(-1), daylightAt(23))
  assert.deepEqual(daylightAt(NaN), daylightAt(12))
  for (let minute = 0; minute < 1440; minute++) {
    const l = daylightAt(minute / 60)
    assert.ok(
      [...l.sky, ...l.land, ...l.horizon, l.sun].every((v) => v >= 0 && v <= 1),
    )
  }
})
test('lighting uses fractional device-local time rather than UTC', () => {
  const date = new Date(2026, 8, 12, 18, 30, 30, 0)
  assert.ok(Math.abs(localHour(date) - 18.5083333333) < 1e-8)
})
