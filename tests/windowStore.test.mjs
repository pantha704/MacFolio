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
  state.openWindow('finder',{projectId:5})
  state.minimizeWindow('finder')
  assert.equal(useWindowStore.getState().windows.finder.isMinimized,true)
  state.restoreWindow('finder')
  assert.deepEqual(useWindowStore.getState().windows.finder.data,{projectId:5})
  assert.equal(useWindowStore.getState().windows.finder.isMinimized,false)
  state.closeWindow('finder')
  assert.equal(useWindowStore.getState().windows.finder.isOpen,false)
  assert.equal(useWindowStore.getState().windows.finder.data,null)
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
