import test from 'node:test'
import assert from 'node:assert/strict'
import {
  acceptsAudio,
  displayTime,
  spotifySource,
} from '../src/music/sources.ts'

const id = 'a'.repeat(22)
test('Spotify links and URIs become canonical, query-free content embeds', () => {
  for (const kind of ['track', 'playlist', 'album', 'artist']) {
    for (const input of [
      ` spotify:${kind}:${id} `,
      `https://open.spotify.com/${kind}/${id}?si=tracking#fragment`,
      `https://open.spotify.com/intl-en/${kind}/${id}/`,
      `https://open.spotify.com/embed/${kind}/${id}?theme=1`,
    ]) {
      const result = spotifySource(input)
      assert.equal(result.kind, kind)
      assert.equal(result.url, `https://open.spotify.com/${kind}/${id}`)
      assert.equal(
        result.embed,
        `https://open.spotify.com/embed/${kind}/${id}?theme=0`,
      )
    }
  }
})
test('Spotify parsing rejects pasted markup, unsafe schemes, lookalikes and unsupported links', () => {
  for (const input of [
    '',
    'javascript:alert(1)',
    `http://open.spotify.com/track/${id}`,
    `https://open.spotify.com.evil.test/track/${id}`,
    `https://open.spotify.com@evil.test/track/${id}`,
    `https://name:password@open.spotify.com/track/${id}`,
    `https://open.spotify.com:8080/track/${id}`,
    `https://open.spotify.com/episode/${id}`,
    'https://spotify.link/short',
    `https://open.spotify.com/track/${id}/extra`,
    'spotify:track:short',
    `<iframe src="https://open.spotify.com/embed/track/${id}"></iframe>`,
  ])
    assert.equal(spotifySource(input), null, input)
})
test('audio imports enforce file bounds while accommodating missing MIME metadata', () => {
  assert.equal(acceptsAudio({ name: 'track.MP3', type: '', size: 100 }), true)
  assert.equal(
    acceptsAudio({ name: 'recording', type: 'audio/ogg', size: 100 }),
    true,
  )
  assert.equal(
    acceptsAudio({ name: 'track.flac', type: '', size: 100 * 1024 * 1024 }),
    true,
  )
  for (const file of [
    { name: 'empty.mp3', type: 'audio/mpeg', size: 0 },
    { name: 'big.mp3', type: 'audio/mpeg', size: 100 * 1024 * 1024 + 1 },
    { name: 'page.html', type: 'text/html', size: 100 },
    { name: 'track.mp3.exe', type: '', size: 100 },
  ])
    assert.equal(acceptsAudio(file), false)
})
test('player time labels handle pending metadata, long tracks and invalid values', () => {
  assert.equal(displayTime(0), '0:00')
  assert.equal(displayTime(61.9), '1:01')
  assert.equal(displayTime(3661), '61:01')
  for (const time of [-10, NaN, Infinity])
    assert.equal(displayTime(time), '0:00')
})
