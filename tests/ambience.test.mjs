import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseAt, seasonAt } from '../src/utils/ambience.ts'
test('wallpaper phase changes at the local clock boundaries', () => {
 assert.deepEqual([0,4,5,7,8,16,17,19,20,23].map(phaseAt), ['night','night','dawn','dawn','day','day','evening','evening','night','night'])
})
test('calendar seasons cover year boundary and both hemispheres', () => {
 assert.equal(seasonAt(11,false),'winter'); assert.equal(seasonAt(0,false),'winter')
 assert.equal(seasonAt(2,false),'spring'); assert.equal(seasonAt(5,false),'summer'); assert.equal(seasonAt(8,false),'autumn')
 assert.equal(seasonAt(11,true),'summer'); assert.equal(seasonAt(5,true),'winter')
})
