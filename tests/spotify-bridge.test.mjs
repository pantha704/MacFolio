import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

// Only our adapter executes. Spotify and the browser are mocked; no remote SDK
// is downloaded and these tests do not establish actual Spotify playback.
const code = await readFile(
  new URL('../public/spotify-player.js', import.meta.url),
  'utf8',
)
const trackUri = 'spotify:track:12sYej7eevoDbZc2JNc77B'
function harness(uri = trackUri) {
  const messages = [],
    listeners = {},
    events = {},
    timers = new Map(),
    scripts = []
  let counter = 0,
    resumes = 0,
    pauses = 0,
    destroyed = 0
  const parent = {
    postMessage: (data, origin) => messages.push({ data, origin }),
  }
  const window = {
    addEventListener: (name, callback) => {
      events[name] = callback
    },
  }
  const controller = {
    addListener: (name, callback) => {
      listeners[name] = callback
    },
    resume: () => resumes++,
    pause: () => pauses++,
    destroy: () => destroyed++,
  }
  const context = {
    URLSearchParams,
    parent,
    window,
    location: {
      origin: 'https://macfolio.test',
      hash: '#' + new URLSearchParams({ uri, session: 'fixture-session' }),
    },
    document: {
      getElementById: () => ({}),
      createElement: () => ({}),
      head: { append: (script) => scripts.push(script) },
    },
    setTimeout: (callback, delay) => {
      const id = ++counter
      timers.set(id, { callback, delay })
      return id
    },
    clearTimeout: (id) => timers.delete(id),
  }
  vm.runInNewContext(code, context)
  const command = (type, overrides = {}) =>
    events.message({
      source: parent,
      origin: context.location.origin,
      data: { channel: 'macfolio-spotify', session: 'fixture-session', type },
      ...overrides,
    })
  const boot = () =>
    window.onSpotifyIframeApiReady({
      createController: (_element, options, callback) => {
        assert.equal(options.uri, uri)
        assert.equal(options.height, 152)
        callback(controller)
      },
    })
  return {
    messages,
    scripts,
    timers,
    command,
    boot,
    listeners,
    events,
    window,
    get resumes() {
      return resumes
    },
    get pauses() {
      return pauses
    },
    get destroyed() {
      return destroyed
    },
  }
}

test('official Spotify adapter queues intent until ready and isolates commands from unrelated frames', () => {
  const h = harness()
  assert.equal(h.scripts[0].src, 'https://open.spotify.com/embed/iframe-api/v1')
  h.command('play', { origin: 'https://other.test' })
  h.command('play', { source: {} })
  h.boot()
  h.listeners.ready()
  assert.equal(h.resumes, 0)
  assert.equal(h.pauses, 1)
  h.command('play')
  assert.equal(h.resumes, 1)
  h.command('pause')
  assert.equal(h.pauses, 2)
  assert.equal(h.timers.size, 0)
  h.events.pagehide()
  assert.equal(h.destroyed, 1)
  const queued = harness()
  queued.command('play')
  queued.boot()
  assert.equal(queued.resumes, 0)
  queued.listeners.ready()
  assert.equal(queued.resumes, 1)
})

test('Spotify adapter reports blocked autoplay, forwards genuine state and ignores a stale single-track URI', () => {
  const h = harness()
  h.command('play')
  h.boot()
  h.listeners.ready()
  const wait = [...h.timers.values()].find((timer) => timer.delay === 5000)
  wait.callback()
  assert.equal(h.messages.at(-1).data.type, 'interaction-required')
  const state = {
    isPaused: false,
    isBuffering: false,
    position: 1200,
    duration: 30000,
  }
  const count = h.messages.length
  h.listeners.playback_update({
    data: { ...state, playingURI: 'spotify:track:5CCGtH9xGsace3C5sb6jC7' },
  })
  assert.equal(h.messages.length, count)
  h.listeners.playback_update({ data: { ...state, playingURI: trackUri } })
  assert.deepEqual(JSON.parse(JSON.stringify(h.messages.at(-1).data)), {
    channel: 'macfolio-spotify',
    session: 'fixture-session',
    type: 'playback',
    paused: false,
    buffering: false,
    position: 1200,
    duration: 30000,
  })
  assert.equal(h.messages.at(-1).origin, 'https://macfolio.test')
  assert.equal(h.timers.size, 0)
  const playlist = harness('spotify:playlist:aaaaaaaaaaaaaaaaaaaaaa')
  playlist.boot()
  playlist.listeners.ready()
  playlist.listeners.playback_update({
    data: { ...state, playingURI: trackUri },
  })
  assert.equal(playlist.messages.at(-1).data.type, 'playback')
})

test('Spotify load failures and teardown clear all adapter timers', () => {
  const h = harness()
  h.scripts[0].onerror()
  assert.equal(h.messages.at(-1).data.type, 'error')
  assert.equal(h.timers.size, 0)
  const stalled = harness()
  ;[...stalled.timers.values()][0].callback()
  assert.equal(stalled.messages.at(-1).data.type, 'error')
  const disposed = harness()
  disposed.boot()
  disposed.command('play')
  disposed.listeners.ready()
  disposed.events.pagehide()
  assert.equal(disposed.timers.size, 0)
})
