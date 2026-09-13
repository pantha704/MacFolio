import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import config from '../vite.config.ts'

const production = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
)
test('Spotify helper is the only document exempt from terminal isolation in production, dev and preview', () => {
  const plugin = config.plugins.find(
    (entry) => entry.name === 'desktop-isolation',
  )
  for (const path of [
    '/',
    '/index.html',
    '/work',
    '/spotify-player.html',
    '/spotify-player.html?test=1',
    '/spotify-player.html/',
    '/spotify-player.js',
  ]) {
    const pathname = path.split('?')[0]
    const headers = Object.fromEntries(
      production.headers
        .filter((rule) => new RegExp(`^${rule.source}$`).test(pathname))
        .flatMap((rule) =>
          rule.headers.map((header) => [header.key, header.value]),
        ),
    )
    const helper = pathname === '/spotify-player.html'
    assert.equal(
      headers['Cross-Origin-Embedder-Policy'],
      helper ? 'unsafe-none' : 'require-corp',
      path,
    )
    if (!helper)
      assert.equal(headers['Cross-Origin-Opener-Policy'], 'same-origin')
    for (const mode of ['configureServer', 'configurePreviewServer']) {
      let middleware,
        next = false
      const local = {}
      plugin[mode]({
        middlewares: {
          use(value) {
            middleware = value
          },
        },
      })
      middleware(
        { url: path },
        {
          setHeader(key, value) {
            local[key] = value
          },
        },
        () => {
          next = true
        },
      )
      assert.equal(
        local['Cross-Origin-Embedder-Policy'],
        headers['Cross-Origin-Embedder-Policy'],
      )
      assert.equal(local['Cross-Origin-Opener-Policy'], 'same-origin')
      assert.equal(next, true)
    }
  }
  assert.equal(
    production.rewrites.some((rule) =>
      new RegExp(`^${rule.source}$`).test('/spotify-player.html'),
    ),
    false,
    'the helper must not serve the SPA recursively',
  )
})
