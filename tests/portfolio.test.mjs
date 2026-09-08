import test from 'node:test'
import assert from 'node:assert/strict'
import { clampWindow } from '../src/utils/windowGeometry.ts'
import { resolveBrowserInput } from '../src/utils/browserUrl.ts'
import { readFavorites, safeSave, safeStorage } from '../src/utils/storage.ts'

test('dragging and resizing cannot hide a window outside the usable desktop', () => {
  for (const viewport of [[1440,900],[1024,768],[768,480],[320,280]]) {
    for (const rect of [{left:-900,top:-200,width:1200,height:900},{left:9999,top:9999,width:400,height:300},{left:20,top:60,width:1,height:1}]) {
      const result = clampWindow(rect, ...viewport)
      assert.ok(result.left >= 12)
      assert.ok(result.top >= 56)
      assert.ok(result.left + result.width <= viewport[0] - 12)
      assert.ok(result.top + result.height <= viewport[1] - 104)
    }
  }
})
test('a valid saved window keeps its position and size', () => {
  const rect = {left:80,top:90,width:500,height:300}
  assert.deepEqual(clampWindow(rect,1440,900),rect)
})
test('Safari allows web links and search but rejects unsafe schemes', () => {
  for (const value of ['javascript:alert(1)','data:text/html,hello','file:///etc/passwd','ftp://example.com','https://user:password@example.com']) assert.equal(resolveBrowserInput(value),null)
  assert.equal(resolveBrowserInput('example.com').url,'https://example.com/')
  assert.equal(resolveBrowserInput('rust anchor').url,'https://www.google.com/search?q=rust%20anchor')
  assert.equal(resolveBrowserInput('  '),null)
})
test('Safari only renders the actual portfolio profile internally', () => {
  assert.equal(resolveBrowserInput('https://github.com/pantha704').internal,true)
  for (const input of ['https://github.com.evil.test/pantha704','https://example.com/github.com','https://github.com/another-user','https://github.com/pantha704/MacFolio']) assert.equal(resolveBrowserInput(input).internal,false)
})
test('corrupt or blocked browser storage does not break the portfolio', () => {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>'{bad',setItem:()=>{throw new Error('blocked')},removeItem:()=>{throw new Error('blocked')}}})
  assert.deepEqual(readFavorites(),[])
  assert.equal(safeSave('x','y'),false)
  assert.doesNotThrow(()=>safeStorage.removeItem('x'))
  globalThis.localStorage.getItem=()=>JSON.stringify(['one','one',4,null,'two'])
  assert.deepEqual(readFavorites(),['one','two'])
  globalThis.localStorage.getItem=()=>'{"not":"an array"}'
  assert.deepEqual(readFavorites(),[])
  delete globalThis.localStorage
})
