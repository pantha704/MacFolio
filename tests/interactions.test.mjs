import test, { after, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from 'esbuild'
import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// DOM interaction tests. The graphics boundary is mocked; these do NOT prove GPU rendering.
const dom = new JSDOM('<!doctype html><body></body>', {
  url: 'https://macfolio.test',
  pretendToBeVisual: true,
})
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLDialogElement',
  'Node',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'localStorage',
  'Image',
])
  Object.defineProperty(globalThis, key, {
    value: dom.window[key],
    configurable: true,
  })
globalThis.IS_REACT_ACT_ENVIRONMENT = true
HTMLElement.prototype.scrollIntoView = () => {}
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute('open', '')
}
window.confirm = () => true
window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
})
globalThis.matchMedia = window.matchMedia
let frames = new Map(),
  frameId = 0,
  stamp = 0
globalThis.requestAnimationFrame = (callback) => {
  frames.set(++frameId, callback)
  return frameId
}
globalThis.cancelAnimationFrame = (id) => frames.delete(id)
const directory = resolve('node_modules/.cache/macfolio-interactions')
await mkdir(directory, { recursive: true })
await build({
  stdin: {
    contents: `export {default as Arcade} from './src/windows/Arcade'; export {default as Finder} from './src/windows/Finder'; export {default as Gallery} from './src/windows/Gallery'; export {default as Settings} from './src/windows/Settings'; export {default as GitHubProfile} from './src/components/apps/GitHubProfile'; export {default as Spotlight} from './src/components/menus/Spotlight'; export {useAppearance} from './src/store/appearance'; export {useSystemStore} from './src/store/systemStore'; export {useWindowStore} from './src/store/useWindowStore';`,
    resolveDir: process.cwd(),
    loader: 'tsx',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: resolve(directory, 'bundle.mjs'),
  jsx: 'automatic',
  loader: { '.css': 'empty', '.jpg': 'text' },
  define: {
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': 'undefined',
    'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': 'undefined',
  },
  alias: {
    '#hoc': resolve('src/hoc'),
    '#store': resolve('src/store'),
    '#components': resolve('src/components'),
    '#constants': resolve('src/constants'),
  },
  plugins: [
    {
      name: 'graphics-boundary',
      setup(builder) {
        builder.onResolve({ filter: /arcade\/renderer$/ }, () => ({
          path: 'graphics',
          namespace: 'test',
        }))
        builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({
          contents:
            'export function createArcadeRenderer(){return {draw(){},dispose(){}}}',
          loader: 'js',
        }))
      },
    },
  ],
})
const app = await import(pathToFileURL(resolve(directory, 'bundle.mjs')).href)
const React = await import('react'),
  { render, fireEvent, cleanup, act, waitFor } =
    await import('@testing-library/react')
const h = React.createElement
const advance = async (seconds) =>
  act(async () => {
    for (let i = 0; i < seconds * 60; i++) {
      stamp += 1000 / 60
      const pending = [...frames.values()]
      frames.clear()
      pending.forEach((callback) => callback(stamp))
    }
  })
afterEach(() => {
  cleanup()
  frames.clear()
  for (const key of Object.keys(app.useWindowStore.getState().windows))
    app.useWindowStore.getState().closeWindow(key)
})
after(async () => {
  dom.window.close()
  await rm(directory, { recursive: true, force: true })
})

test('Arcade start, pause, resume, restart, app switch and selection are wired to gameplay', async () => {
  app.useWindowStore.getState().openWindow('arcade')
  const ui = render(h(app.Arcade))
  fireEvent.click(ui.getByRole('tab', { name: /Nightshift/ }))
  await waitFor(() =>
    assert.equal(
      ui.getByRole('button', { name: 'Start playing' }).disabled,
      false,
    ),
  )
  fireEvent.click(ui.getByRole('button', { name: 'Start playing' }))
  await advance(3)
  const score = () =>
    Number(
      ui
        .getByLabelText('Score')
        .querySelector('strong')
        .textContent.replace(/\D/g, ''),
    )
  assert.ok(score() > 50)
  fireEvent.click(ui.getByRole('button', { name: 'Pause game' }))
  assert.ok(ui.getByText('Paused.'))
  const paused = score()
  await advance(2)
  assert.equal(score(), paused)
  fireEvent.click(ui.getByRole('button', { name: 'Resume playing' }))
  await advance(1)
  assert.ok(score() > paused)
  act(() => app.useWindowStore.getState().openWindow('finder'))
  assert.ok(ui.getByText('Paused.'))
  act(() => app.useWindowStore.getState().focusWindow('arcade'))
  fireEvent.click(ui.getByRole('button', { name: 'Restart game' }))
  assert.equal(score(), 0)
  fireEvent.click(ui.getByRole('tab', { name: /Rally Room/ }))
  await waitFor(() => assert.ok(ui.getByText('Find your rhythm.')))
})
test('Finder filters and navigates with history; background Escape cannot change its project', () => {
  app.useWindowStore.getState().openWindow('finder')
  const ui = render(h(app.Finder))
  fireEvent.change(ui.getByLabelText('Filter projects'), {
    target: { value: 'homeworker' },
  })
  assert.equal(ui.container.querySelectorAll('.finder-project').length, 1)
  fireEvent.click(ui.container.querySelector('.finder-project'))
  assert.ok(ui.getByRole('heading', { name: 'Homeworker' }))
  act(() => app.useWindowStore.getState().openWindow('settings'))
  fireEvent.keyDown(window, { key: 'Escape' })
  assert.ok(ui.getByRole('heading', { name: 'Homeworker' }))
  act(() => app.useWindowStore.getState().focusWindow('finder'))
  fireEvent.keyDown(window, { key: 'Escape' })
  assert.ok(ui.getByRole('heading', { name: 'Things I’ve built.' }))
  fireEvent.click(ui.getByRole('button', { name: 'Back', exact: true }))
  assert.ok(ui.getByRole('heading', { name: 'Homeworker' }))
})
test('photo deletion Undo restores its position, favorite and selected wallpaper', () => {
  app.useSystemStore
    .getState()
    .setGalleryImages([
      'https://example.test/a.jpg',
      'https://example.test/b.jpg',
    ])
  app.useSystemStore.getState().setWallpaper('https://example.test/a.jpg')
  localStorage.setItem(
    'gallery_favorites',
    JSON.stringify(['https://example.test/a.jpg']),
  )
  app.useWindowStore.getState().openWindow('photos')
  const ui = render(h(app.Gallery))
  fireEvent.click(
    ui.getAllByRole('button', { name: 'Remove photo from this device' })[0],
  )
  assert.equal(app.useSystemStore.getState().galleryImages.length, 1)
  fireEvent.click(ui.getByRole('button', { name: 'Undo' }))
  assert.deepEqual(app.useSystemStore.getState().galleryImages, [
    'https://example.test/a.jpg',
    'https://example.test/b.jpg',
  ])
  assert.equal(app.useAppearance.getState().scene, 'photo')
  assert.equal(
    app.useSystemStore.getState().wallpaper,
    'https://example.test/a.jpg',
  )
  assert.ok(ui.getByRole('button', { name: 'Remove favorite' }))
})
test('photo wallpaper action accounts for current scene, not only a stored photo URL', () => {
  app.useAppearance.getState().update({ scene: 'living' })
  app.useWindowStore.getState().openWindow('photos')
  const ui = render(h(app.Gallery))
  fireEvent.click(ui.getByRole('button', { name: 'Open photo 1' }))
  assert.ok(ui.getByRole('button', { name: 'Set as wallpaper' }))
  fireEvent.click(ui.getByRole('button', { name: 'Set as wallpaper' }))
  assert.equal(app.useAppearance.getState().scene, 'photo')
  fireEvent.click(
    ui.getByRole('button', { name: 'Return to automatic wallpaper' }),
  )
  assert.equal(app.useAppearance.getState().scene, 'living')
  assert.equal(app.useAppearance.getState().time, 'auto')
})
test('manual time slider, automatic reset and seasonal preference work together', () => {
  app.useWindowStore.getState().openWindow('settings')
  const ui = render(h(app.Settings))
  fireEvent.click(ui.getByRole('button', { name: 'Set the mood' }))
  fireEvent.change(ui.getByLabelText('Preview time of day'), {
    target: { value: 390 },
  })
  assert.equal(app.useAppearance.getState().manualHour, 6.5)
  fireEvent.click(ui.getByRole('button', { name: 'night', exact: true }))
  assert.equal(app.useAppearance.getState().manualHour, 23)
  fireEvent.click(ui.getByRole('switch', { name: /Seasonal palette/ }))
  assert.ok(ui.getByRole('combobox'))
  fireEvent.click(ui.getByRole('button', { name: 'Follow my local time' }))
  assert.equal(app.useAppearance.getState().time, 'auto')
  assert.equal(app.useAppearance.getState().scene, 'living')
})
test('slow stars do not delay GitHub profile and repositories', async () => {
  let resolveStars
  const starPromise = new Promise((resolve) => {
    resolveStars = resolve
  })
  const user = {
    login: 'pantha704',
    name: 'Pratham',
    public_repos: 106,
    followers: 4,
    following: 8,
    html_url: 'https://github.com/pantha704',
    avatar_url: 'https://example.test/a.png',
  }
  const repo = {
    id: 1,
    name: 'MacFolio',
    html_url: 'https://github.com/pantha704/MacFolio',
    updated_at: '2026-09-12T00:00:00Z',
    stargazers_count: 1,
    forks_count: 0,
  }
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => ({
    ok: true,
    json: () =>
      url.includes('starred')
        ? starPromise
        : Promise.resolve(url.includes('/repos?') ? [repo] : user),
  })
  try {
    const ui = render(h(app.GitHubProfile))
    await waitFor(() => assert.ok(ui.getByRole('heading', { name: 'Pratham' })))
    assert.ok(ui.getByText('MacFolio'))
    fireEvent.click(ui.getByRole('button', { name: 'Stars' }))
    assert.ok(ui.getByText('Loading recent stars…'))
    await act(async () => resolveStars([repo]))
    assert.ok(ui.getByText('MacFolio'))
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('window buttons minimize, restore and close; titlebar double click maximizes', async () => {
  app.useWindowStore.getState().openWindow('finder')
  const ui = render(h(app.Finder))
  fireEvent.doubleClick(ui.container.querySelector('.window-header'))
  assert.equal(app.useWindowStore.getState().windows.finder.isMaximized, true)
  fireEvent.click(ui.getByRole('button', { name: 'Restore window size' }))
  assert.equal(app.useWindowStore.getState().windows.finder.isMaximized, false)
  fireEvent.click(ui.getByRole('button', { name: 'Minimize window' }))
  assert.equal(ui.container.querySelector('#finder').hidden, true)
  act(() => app.useWindowStore.getState().launchFromDock('finder'))
  assert.equal(ui.container.querySelector('#finder').hidden, false)
  fireEvent.click(ui.getByRole('button', { name: 'Close window' }))
  assert.equal(ui.container.querySelector('#finder'), null)
})

test('legacy night preferences migrate to night lighting, and corrupt hours fall back safely', async () => {
  localStorage.setItem('macfolio-appearance', JSON.stringify({ version: 1, state: { mode: 'night' } }))
  await app.useAppearance.persist.rehydrate()
  assert.equal(app.useAppearance.getState().scene, 'living')
  assert.equal(app.useAppearance.getState().manualHour, 23)
  localStorage.setItem('macfolio-appearance', JSON.stringify({ version: 3, state: { manualHour: 'broken', manualPhase: 'invalid' } }))
  await app.useAppearance.persist.rehydrate()
  assert.equal(app.useAppearance.getState().manualHour, 12)
})

test('time preview shows exact minutes despite floating point fractional hours', () => {
  app.useWindowStore.getState().openWindow('settings')
  const ui = render(h(app.Settings))
  fireEvent.click(ui.getByRole('button', { name: 'Set the mood' }))
  for (const minute of [1, 367, 1086, 1439]) {
    fireEvent.change(ui.getByLabelText('Preview time of day'), { target: { value: minute } })
    assert.equal(ui.container.querySelector('output').textContent, `${String(Math.floor(minute / 60)).padStart(2,'0')}:${String(minute % 60).padStart(2,'0')}`)
  }
})

test('Spotlight launches the chosen app without restoring focus to the previous window', () => {
  const previous = document.createElement('button')
  document.body.appendChild(previous)
  previous.focus()
  let restored = 0
  previous.addEventListener('focus', () => restored++)
  const ui = render(h(app.Spotlight, { onClose: () => ui.unmount() }))
  fireEvent.change(ui.getByRole('combobox'), { target: { value: 'terminal' } })
  fireEvent.keyDown(ui.getByRole('combobox'), { key: 'Enter' })
  assert.equal(app.useWindowStore.getState().focusedWindow, 'terminal')
  assert.equal(restored, 0)
  previous.remove()
})
