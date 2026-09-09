import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const temp = await mkdtemp(join(tmpdir(),'macfolio-test-'))
let useWindowStore
try {
  await build({entryPoints:['src/store/useWindowStore.ts'],bundle:true,platform:'node',format:'esm',outfile:join(temp,'store.mjs'),alias:{'#constants':join(process.cwd(),'src/constants/index.ts')}})
  ;({useWindowStore}=await import(pathToFileURL(join(temp,'store.mjs')).href))
} finally { await rm(temp,{recursive:true,force:true}) }

test('minimize/restore preserves application data; close resets it',()=>{
  const state=useWindowStore.getState()
  state.openWindow('finder',{projectId:'macfolio'})
  state.minimizeWindow('finder')
  assert.equal(useWindowStore.getState().windows.finder.isMinimized,true)
  state.restoreWindow('finder')
  assert.deepEqual(useWindowStore.getState().windows.finder.data,{projectId:'macfolio'})
  assert.equal(useWindowStore.getState().windows.finder.isMinimized,false)
  state.closeWindow('finder')
  assert.equal(useWindowStore.getState().windows.finder.isOpen,false)
  assert.equal(useWindowStore.getState().windows.finder.data,null)
})

test('Dock clicks open, minimize, and restore the same application', () => {
  const state = useWindowStore.getState()
  state.closeWindow('arcade')
  state.launchFromDock('arcade')
  assert.equal(useWindowStore.getState().focusedWindow, 'arcade')
  state.launchFromDock('arcade')
  assert.equal(useWindowStore.getState().windows.arcade.isMinimized, true)
  state.launchFromDock('arcade')
  assert.equal(useWindowStore.getState().windows.arcade.isMinimized, false)
  assert.equal(useWindowStore.getState().focusedWindow, 'arcade')
})

test('Show Desktop restores exactly the windows it hid', () => {
  const state = useWindowStore.getState()
  for (const key of Object.keys(state.windows)) state.closeWindow(key)
  state.openWindow('finder')
  state.openWindow('settings')
  state.toggleShowDesktop()
  assert.equal(useWindowStore.getState().windows.finder.isMinimized, true)
  assert.equal(useWindowStore.getState().windows.settings.isMinimized, true)
  state.toggleShowDesktop()
  assert.equal(useWindowStore.getState().windows.finder.isMinimized, false)
  assert.equal(useWindowStore.getState().windows.settings.isMinimized, false)
  assert.equal(useWindowStore.getState().focusedWindow, 'settings')
})

test('repeated focus changes keep z-indices finite and compact', () => {
  const state = useWindowStore.getState()
  for (let index = 0; index < 250; index += 1) state.focusWindow(index % 2 ? 'finder' : 'settings')
  const current = useWindowStore.getState()
  const open = Object.values(current.windows).filter(window => window.isOpen)
  const zIndices = open.map(window => window.zIndex)
  assert.equal(Math.max(...zIndices) - Math.min(...zIndices), open.length - 1)
  assert.equal(new Set(zIndices).size, open.length)
  assert.equal(current.nextZIndex, Math.max(...zIndices) + 1)
})
test('focusing and maximizing move the intended window above its peers',()=>{
  const state=useWindowStore.getState()
  state.openWindow('finder')
  state.openWindow('contact')
  assert.ok(useWindowStore.getState().windows.contact.zIndex>useWindowStore.getState().windows.finder.zIndex)
  state.focusWindow('finder')
  assert.ok(useWindowStore.getState().windows.finder.zIndex>useWindowStore.getState().windows.contact.zIndex)
  state.maximizeWindow('finder')
  assert.equal(useWindowStore.getState().windows.finder.isMaximized,true)
  state.maximizeWindow('finder')
  assert.equal(useWindowStore.getState().windows.finder.isMaximized,false)
})
