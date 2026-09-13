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
  fireEvent.click(ui.getByRole('button', { name: 'Use Spotify link' }))
}
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
  assert.equal(ui.getAllByRole('listitem').length, 2)
  assert.match(ui.getByRole('status').textContent, /1 file skipped/)
  assert.equal(played.length, 0)
  fireEvent.click(ui.getByRole('button', { name: 'Play First song' }))
  const player = ui.container.querySelector('audio')
  assert.equal(ui.queryByRole('dialog'), null)
  assert.equal(played.length, 1)
  assert.equal(player.paused, false)
  Object.defineProperty(player, 'duration', { value: 180, configurable: true })
  fireEvent.loadedMetadata(player)
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

test('switching to Spotify stops audio, loads only on request, persists its link and stops on return to files', () => {
  const ui = render(h(DesktopMusic))
  openLibrary(ui)
  importFiles(ui, [file('First.mp3')])
  fireEvent.click(ui.getByRole('button', { name: 'Play First' }))
  openLibrary(ui)
  saveSpotify(ui)
  const player = ui.container.querySelector('audio')
  assert.equal(player.paused, true)
  assert.equal(ui.container.querySelector('iframe'), null)
  // An event already queued by the old audio source must not restart it over Spotify.
  const before = played.length
  fireEvent.ended(player)
  fireEvent.waiting(player)
  fireEvent.playing(player)
  assert.equal(played.length, before)
  assert.equal(player.paused, true)
  fireEvent.click(ui.getByRole('button', { name: 'Load Spotify player' }))
  const embed = ui.getByTitle('Spotify player: Evening rotation')
  assert.equal(
    embed.getAttribute('src'),
    link.replace('/playlist/', '/embed/playlist/') + '?theme=0',
  )
  assert.match(embed.getAttribute('allow'), /encrypted-media/)
  assert.equal(
    JSON.parse(localStorage.getItem('macfolio-music-spotify')).url,
    link,
  )
  openLibrary(ui)
  fireEvent.click(ui.getByRole('button', { name: 'Play First' }))
  assert.equal(ui.container.querySelector('iframe'), null)
  assert.equal(player.paused, false)
  ui.unmount()
  const reload = render(h(DesktopMusic))
  assert.ok(reload.getByRole('heading', { name: 'Evening rotation' }))
  assert.equal(reload.container.querySelector('iframe'), null)
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
  assert.equal(
    unsupported.queryByRole('button', { name: 'Load Spotify player' }),
    null,
  )
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
  fireEvent.click(
    supported.getByRole('button', { name: 'Load Spotify player' }),
  )
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
  fireEvent.click(ui.getByRole('button', { name: 'Use Spotify link' }))
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
