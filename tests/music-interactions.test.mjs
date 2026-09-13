import test, { after, afterEach, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from 'esbuild'
import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// The browser audio boundary is mocked. These tests verify player state and
// resource ownership, not actual codecs, sound output, autoplay or Spotify service playback.
const dom = new JSDOM('<!doctype html><body></body>', {
  url: 'https://macfolio.test',
})
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLDialogElement',
  'HTMLIFrameElement',
  'HTMLMediaElement',
  'Node',
  'Event',
  'File',
  'DOMException',
  'localStorage',
]) {
  Object.defineProperty(globalThis, key, {
    value: dom.window[key],
    configurable: true,
  })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open')
}
const paused = new WeakMap(),
  played = [],
  revoked = []
let nextPlayback,
  objectId = 0
Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
  get() {
    return paused.get(this) ?? true
  },
})
HTMLMediaElement.prototype.play = function () {
  played.push(this.getAttribute('src'))
  if (nextPlayback) {
    const next = nextPlayback
    nextPlayback = undefined
    return next()
  }
  paused.set(this, false)
  this.dispatchEvent(new Event('playing'))
  return Promise.resolve()
}
HTMLMediaElement.prototype.pause = function () {
  paused.set(this, true)
  this.dispatchEvent(new Event('pause'))
}
HTMLMediaElement.prototype.load = function () {
  this.currentTime = 0
}
URL.createObjectURL = () => `blob:https://macfolio.test/${++objectId}`
URL.revokeObjectURL = (url) => revoked.push(url)
const directory = resolve('node_modules/.cache/macfolio-music-tests')
await mkdir(directory, { recursive: true })
await build({
  entryPoints: ['src/components/DesktopMusic.tsx'],
  outfile: resolve(directory, 'bundle.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  loader: { '.css': 'empty' },
})
const { default: DesktopMusic } = await import(
  pathToFileURL(resolve(directory, 'bundle.mjs')).href
)
const React = await import('react')
const { render, fireEvent, cleanup, act } =
  await import('@testing-library/react')
const h = React.createElement
const link = `https://open.spotify.com/playlist/${'a'.repeat(22)}`
const file = (name) =>
  new File(['audio fixture'], name, { type: 'audio/mpeg', lastModified: 1 })
const openLibrary = (ui) =>
  fireEvent.click(ui.getByRole('button', { name: 'Choose music', exact: true }))
const importFiles = (ui, files) =>
  fireEvent.change(ui.getByLabelText('Audio files'), { target: { files } })
const saveSpotify = (ui) => {
  fireEvent.change(ui.getByLabelText('Spotify link'), {
    target: { value: `${link}?si=tracking` },
  })
  fireEvent.change(ui.getByLabelText(/^Name/), {
    target: { value: 'Evening rotation' },
  })
  fireEvent.click(ui.getByRole('button', { name: 'Add to collection' }))
}
const spotifyEvent = (frame, data, overrides = {}) => {
  const session = new URLSearchParams(new URL(frame.src).hash.slice(1)).get(
    'session',
  )
  fireEvent(
    window,
    new dom.window.MessageEvent('message', {
      origin: window.location.origin,
      source: frame.contentWindow,
      data: { channel: 'macfolio-spotify', session, ...data },
      ...overrides,
    }),
  )
}
const isSpinning = (ui) =>
  ui
    .getByRole('complementary', { name: 'Music player' })
    .classList.contains('is-playing')
beforeEach(() => {
  Object.defineProperty(globalThis, 'crossOriginIsolated', {
    value: false,
    configurable: true,
  })
  localStorage.clear()
  played.length = 0
  revoked.length = 0
  nextPlayback = undefined
})
afterEach(() => {
  cleanup()
  delete HTMLIFrameElement.prototype.credentialless
})
after(async () => {
  dom.window.close()
  await rm(directory, { recursive: true, force: true })
})

test('local queue imports, plays, seeks, changes volume and advances without auto-starting on import', async () => {
  const ui = render(h(DesktopMusic))
  openLibrary(ui)
  const first = file('First_song.mp3'),
    second = file('Second.mp3')
  importFiles(ui, [
    first,
    first,
    second,
    new File(['bad'], 'image.png', { type: 'image/png' }),
  ])
  assert.equal(ui.getAllByRole('listitem').length, 5) // Three curated tracks plus the local queue.
  assert.match(ui.getByRole('status').textContent, /1 file skipped/)
  assert.equal(played.length, 0)
  fireEvent.click(ui.getByRole('button', { name: 'Play First song' }))
  const player = ui.container.querySelector('audio')
  assert.equal(ui.queryByRole('dialog'), null)
  assert.equal(played.length, 1)
  assert.equal(player.paused, false)
  Object.defineProperty(player, 'duration', { value: 180, configurable: true })
  fireEvent.loadedMetadata(player)
  fireEvent.click(ui.getByRole('button', { name: 'Playback settings' }))
  fireEvent.change(ui.getByLabelText('Track position'), {
    target: { value: 42 },
  })
  assert.equal(player.currentTime, 42)
  assert.ok(ui.getByText('0:42'))
  fireEvent.change(ui.getByLabelText('Music volume'), {
    target: { value: 0.25 },
  })
  assert.equal(player.volume, 0.25)
  fireEvent.click(ui.getByRole('button', { name: 'Pause music' }))
  assert.equal(player.paused, true)
  assert.equal(isSpinning(ui), false)
  fireEvent.click(ui.getByRole('button', { name: 'Play music' }))
  fireEvent.ended(player)
  assert.ok(ui.getByRole('heading', { name: 'Second' }))
  const count = played.length
  fireEvent.ended(player)
  assert.equal(played.length, count)
  assert.equal(player.paused, true)
  fireEvent.click(ui.getByRole('button', { name: 'Repeat queue' }))
  fireEvent.click(ui.getByRole('button', { name: 'Play music' }))
  fireEvent.ended(player)
  assert.ok(ui.getByRole('heading', { name: 'First song' }))
  assert.equal(player.paused, false)
  await act(async () => {})
})

test('adding to a playing queue preserves playback; removal and unmount release local files', () => {
  const ui = render(h(React.StrictMode, null, h(DesktopMusic)))
  openLibrary(ui)
  importFiles(ui, [file('First.mp3')])
  fireEvent.click(ui.getByRole('button', { name: 'Play First' }))
  const player = ui.container.querySelector('audio'),
    firstUrl = player.getAttribute('src')
  openLibrary(ui)
  importFiles(ui, [file('Second.mp3')])
  assert.equal(player.paused, false)
  assert.equal(played.length, 1)
  fireEvent.click(ui.getByRole('button', { name: 'Remove First' }))
  assert.equal(player.paused, true)
  assert.equal(player.hasAttribute('src'), false)
  assert.deepEqual(revoked, [firstUrl])
  ui.unmount()
  assert.equal(revoked.length, 2)
  assert.equal(new Set(revoked).size, 2)
})

test('saving to the shelf preserves playback; choosing Spotify stops local audio and persists multiple links', () => {
  const ui = render(h(DesktopMusic))
  openLibrary(ui)
  importFiles(ui, [file('First.mp3')])
  fireEvent.click(ui.getByRole('button', { name: 'Play First' }))
  openLibrary(ui)
  saveSpotify(ui)
  const player = ui.container.querySelector('audio')
  assert.equal(player.paused, false)
  assert.equal(document.querySelector('iframe'), null)
  fireEvent.click(ui.getByRole('button', { name: 'Play Evening rotation' }))
  assert.equal(player.paused, true)
  // An event already queued by the old audio source must not restart it over Spotify.
  const before = played.length
  fireEvent.ended(player)
  fireEvent.waiting(player)
  fireEvent.playing(player)
  assert.equal(played.length, before)
  assert.equal(player.paused, true)
  const embed = ui.getByTitle('Spotify player: Evening rotation')
  assert.equal(new URL(embed.src).pathname, '/spotify-player.html')
  assert.equal(
    new URLSearchParams(new URL(embed.src).hash.slice(1)).get('uri'),
    `spotify:playlist:${'a'.repeat(22)}`,
  )
  assert.match(embed.getAttribute('allow'), /encrypted-media/)
  spotifyEvent(embed, {
    type: 'playback',
    paused: false,
    buffering: false,
    duration: 30000,
    position: 29000,
  })
  spotifyEvent(embed, {
    type: 'playback',
    paused: true,
    buffering: false,
    duration: 30000,
    position: 30000,
  })
  assert.equal(
    ui.getByTitle('Spotify player: Evening rotation'),
    embed,
    'a playlist manages its own track sequencing',
  )
  assert.equal(
    JSON.parse(localStorage.getItem('macfolio-music-collection')).items[0].url,
    link,
  )
  openLibrary(ui)
  fireEvent.click(ui.getByRole('button', { name: 'Play First' }))
  assert.equal(document.querySelector('iframe'), null)
  assert.equal(player.paused, false)
  openLibrary(ui)
  fireEvent.change(ui.getByLabelText('Spotify link'), {
    target: { value: `spotify:album:${'b'.repeat(22)}` },
  })
  fireEvent.click(ui.getByRole('button', { name: 'Add to collection' }))
  assert.equal(
    JSON.parse(localStorage.getItem('macfolio-music-collection')).items.length,
    2,
  )
  ui.unmount()
  const reload = render(h(DesktopMusic))
  assert.ok(reload.getByRole('heading', { name: 'Evening rotation' }))
  assert.equal(document.querySelector('iframe'), null)
  openLibrary(reload)
  assert.equal(reload.getAllByRole('listitem').length, 5)
})

test('isolated browsers use credentialless embeds when supported and an external fallback otherwise', () => {
  Object.defineProperty(globalThis, 'crossOriginIsolated', {
    value: true,
    configurable: true,
  })
  localStorage.setItem(
    'macfolio-music-spotify',
    JSON.stringify({ title: 'Saved playlist', url: link }),
  )
  const unsupported = render(h(DesktopMusic))
  fireEvent.click(unsupported.getByRole('button', { name: 'Play music' }))
  assert.equal(document.querySelector('iframe'), null)
  assert.equal(isSpinning(unsupported), false)
  assert.equal(
    unsupported.getByRole('link', { name: /Open Spotify/ }).href,
    link,
  )
  unsupported.unmount()
  Object.defineProperty(HTMLIFrameElement.prototype, 'credentialless', {
    value: false,
    configurable: true,
  })
  const supported = render(h(DesktopMusic))
  fireEvent.click(supported.getByRole('button', { name: 'Play music' }))
  assert.equal(
    supported
      .getByTitle('Spotify player: Saved playlist')
      .hasAttribute('credentialless'),
    true,
  )
})

test('invalid sources and blocked playback give actionable errors, and obsolete playback errors are ignored', async () => {
  localStorage.setItem('macfolio-music-spotify', '{broken')
  const ui = render(h(DesktopMusic))
  openLibrary(ui)
  fireEvent.change(ui.getByLabelText('Spotify link'), {
    target: { value: 'javascript:alert(1)' },
  })
  fireEvent.click(ui.getByRole('button', { name: 'Add to collection' }))
  assert.match(ui.getByRole('status').textContent, /Paste a Spotify/)
  importFiles(ui, [file('First.mp3'), file('Second.mp3')])
  nextPlayback = () =>
    Promise.reject(new DOMException('blocked', 'NotAllowedError'))
  await act(async () =>
    fireEvent.click(ui.getByRole('button', { name: 'Play First' })),
  )
  assert.match(ui.getByRole('status').textContent, /Press play again/)
  let rejectOld
  nextPlayback = () =>
    new Promise((_, reject) => {
      rejectOld = reject
    })
  fireEvent.click(ui.getByRole('button', { name: 'Play music' }))
  fireEvent.click(ui.getByRole('button', { name: 'Next track' }))
  await act(async () => rejectOld(new Error('obsolete request')))
  assert.equal(ui.queryByRole('status'), null)
  assert.ok(ui.getByRole('heading', { name: 'Second' }))
  assert.ok(ui.getByRole('button', { name: 'Pause music' }))
  fireEvent.error(ui.container.querySelector('audio'))
  assert.match(ui.getByRole('status').textContent, /another file or format/)
  assert.ok(ui.getByRole('button', { name: 'Play music' }))
})

test('music library contains desktop shortcuts and returns focus when dismissed', () => {
  const ui = render(h(DesktopMusic))
  const trigger = ui.getByRole('button', { name: 'Choose music', exact: true })
  trigger.focus()
  openLibrary(ui)
  let leaked = 0
  const onKey = () => leaked++
  window.addEventListener('keydown', onKey)
  fireEvent.keyDown(ui.getByLabelText('Spotify link'), {
    key: 'k',
    ctrlKey: true,
  })
  assert.equal(leaked, 0)
  fireEvent(ui.getByRole('dialog'), new Event('cancel', { cancelable: true }))
  assert.equal(ui.queryByRole('dialog'), null)
  assert.equal(document.activeElement, trigger)
  window.removeEventListener('keydown', onKey)
})

test('Spotify record animation follows authenticated frame playback, buffering and pause events', () => {
  const ui = render(h(DesktopMusic))
  assert.equal(document.querySelector('iframe'), null)
  assert.equal(isSpinning(ui), false)
  fireEvent.click(ui.getByRole('button', { name: 'Play music' }))
  const frame = ui.getByTitle('Spotify player: Mondstadt Nighttime')
  assert.equal(isSpinning(ui), false, 'loading must not pretend to play')
  const state = {
    type: 'playback',
    paused: false,
    buffering: false,
    position: 2000,
    duration: 30000,
  }
  spotifyEvent(frame, state, { origin: 'https://untrusted.test' })
  spotifyEvent(frame, state, { source: window })
  spotifyEvent(frame, { ...state, session: 'obsolete' })
  assert.equal(isSpinning(ui), false)
  spotifyEvent(frame, state)
  assert.equal(isSpinning(ui), true)
  spotifyEvent(frame, { ...state, buffering: true })
  assert.equal(isSpinning(ui), false)
  spotifyEvent(frame, state)
  assert.equal(isSpinning(ui), true)
  spotifyEvent(frame, { ...state, paused: true })
  assert.equal(isSpinning(ui), false)
  spotifyEvent(frame, { type: 'interaction-required' })
  assert.match(ui.getByRole('status').textContent, /Spotify controls/)
  assert.ok(ui.getByRole('button', { name: 'Play music' }))
  spotifyEvent(frame, state)
  assert.equal(ui.queryByRole('status'), null)
  fireEvent.click(ui.getByRole('button', { name: 'Close Spotify player' }))
  assert.equal(document.querySelector('iframe'), null)
  assert.equal(isSpinning(ui), false)
})

test('Spotify defaults advance on completion, stale frames cannot restart sound, and retry replaces the failed session', () => {
  const ui = render(h(DesktopMusic))
  fireEvent.click(ui.getByRole('button', { name: 'Play music' }))
  const first = ui.getByTitle('Spotify player: Mondstadt Nighttime')
  const state = {
    type: 'playback',
    paused: false,
    buffering: false,
    position: 29000,
    duration: 30000,
  }
  spotifyEvent(first, state)
  spotifyEvent(first, { ...state, paused: true, position: 30000 })
  const second = ui.getByTitle('Spotify player: Choral Chambers')
  assert.equal(isSpinning(ui), false)
  spotifyEvent(first, state)
  assert.equal(isSpinning(ui), false)
  spotifyEvent(second, { type: 'error' })
  assert.match(ui.getByRole('status').textContent, /could not connect/)
  fireEvent.click(ui.getByRole('button', { name: 'Retry' }))
  const retried = ui.getByTitle('Spotify player: Choral Chambers')
  assert.notEqual(retried, second)
  assert.notEqual(retried.src, second.src)
  spotifyEvent(retried, state)
  assert.equal(isSpinning(ui), true)
  fireEvent.click(ui.getByRole('button', { name: 'Next track' }))
  const third = ui.getByTitle('Spotify player: in the sea')
  spotifyEvent(third, state)
  spotifyEvent(third, { ...state, paused: true, position: 30000 })
  assert.ok(ui.getByRole('heading', { name: 'in the sea' }))
  assert.equal(isSpinning(ui), false)
})

test('saved collection rejects duplicates and corruption, and removal survives reload', () => {
  localStorage.setItem(
    'macfolio-music-collection',
    JSON.stringify({
      items: [
        { title: 'Unsafe', url: 'javascript:alert(1)' },
        { title: 'Old favorite', url: link },
        { title: 'Duplicate', url: `${link}?si=123` },
        {
          title: 'Default duplicate',
          url: 'https://open.spotify.com/track/12sYej7eevoDbZc2JNc77B',
        },
      ],
      selected: 'javascript:alert(1)',
    }),
  )
  const ui = render(h(DesktopMusic))
  assert.ok(ui.getByRole('heading', { name: 'Mondstadt Nighttime' }))
  openLibrary(ui)
  assert.equal(ui.getAllByRole('listitem').length, 4)
  saveSpotify(ui)
  assert.match(
    ui.getByRole('status').textContent,
    /already on your record shelf/,
  )
  fireEvent.click(ui.getByRole('button', { name: 'Remove Old favorite' }))
  assert.equal(ui.getAllByRole('listitem').length, 3)
  ui.unmount()
  const reload = render(h(DesktopMusic))
  openLibrary(reload)
  assert.equal(reload.getAllByRole('listitem').length, 3)
})

test('blocked storage still allows an in-memory collection without claiming it was saved', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem() {
        throw new Error('disabled')
      },
      setItem() {
        throw new Error('quota')
      },
    },
  })
  try {
    const ui = render(h(DesktopMusic))
    openLibrary(ui)
    saveSpotify(ui)
    assert.match(ui.getByRole('status').textContent, /could not save/)
    assert.ok(ui.getByRole('button', { name: 'Play Evening rotation' }))
  } finally {
    Object.defineProperty(globalThis, 'localStorage', descriptor)
  }
})
