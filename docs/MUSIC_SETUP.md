# Stillwater record player

The large desktop card has become a floating vinyl record and metallic tonearm. Press the record to play or pause. The arm settles over the groove and the disc spins only while audio is actually playing; buffering, pause and failures return it to rest. Reduced-motion preferences disable rotation and arm movement.

The shelf button opens the collection. Previous/next controls move through the current source’s queue. Native audio’s seek, volume and repeat controls live under Playback settings.

## Default rotation

Every visitor starts with these public Spotify selections, without autoplay:

| Title               | Artist             | Spotify track                                         |
| ------------------- | ------------------ | ----------------------------------------------------- |
| Mondstadt Nighttime | Chewie Melodies    | https://open.spotify.com/track/12sYej7eevoDbZc2JNc77B |
| Choral Chambers     | Christopher Larkin | https://open.spotify.com/track/5CCGtH9xGsace3C5sb6jC7 |
| in the sea          | kensuke ushio      | https://open.spotify.com/track/3pFPWe9ZYmOFzSKBbSBUVD |

Edit the `featuredSpotify` array in `src/data/music.ts` to change the public rotation. Entries have `title`, `artist` (optional), and a canonical public Spotify `url`.

## Personal collection

Visitors can add Spotify track, album, artist and playlist links with optional names. Up to 100 personal bookmarks and the selected Spotify entry are saved under `macfolio-music-collection` in localStorage. This is a local record shelf; it does not create or modify playlists in a Spotify account.

The three defaults remain available alongside personal additions. Canonical URLs are deduplicated, pasted markup and unsafe URLs are rejected, and older single-link preferences migrate automatically. Removing a personal entry persists across refreshes. Corrupt storage falls back to the default rotation. If storage is blocked or full, selections remain usable for the visit and a message explains that saving failed.

No Spotify audio, credentials or visitor identity is stored. Local audio files are separate and last for the page visit.

## Official Spotify playback

Spotify loads only after a visitor chooses Play. Its unmodified player appears in a small panel beside the record (above it on portrait phones). The official iFrame API reports playback state to the disc. Close the Spotify panel to stop and unload it.

Spotify determines availability and preview length. A full-track, ad-free experience is not guaranteed. If the browser declines programmatic playback, the record stays still and asks the visitor to use Spotify’s visible Play control. Retry and Open Spotify remain available after a failed connection. Album/playlist sequencing belongs to Spotify; individual selections advance only when the provider reports completion.

There is no API key, OAuth setup, paid Web Playback SDK or new backend. No commercial songs are downloaded or rehosted.

### Terminal compatibility

The desktop still uses COOP `same-origin` and COEP `require-corp` for the real WebContainer terminal. Only `/spotify-player.html` has a COEP `unsafe-none` exception and is excluded from the SPA rewrite. The same route distinction exists in Vite development/preview and Vercel production configuration.

This helper loads the official Spotify iFrame API in a credentialless child on supporting isolated browsers. Parent/child messages validate the window, origin and per-frame session. It does not use Spotify’s private message protocol. Obsolete frames cannot update the new selection.

Credentialless embeds do not share the visitor’s normal Spotify cookies. On isolated browsers without credentialless iframe support, Open Spotify and native local-file playback remain available. Keep the main desktop isolation headers intact on any alternate host.

## Full local audio

Choose Add audio or drop files into the shelf. Files are not uploaded and are available for this page visit. Imports accept browser-supported MP3, M4A, Ogg, WAV, FLAC and other audio formats, capped at 50 tracks and 100 MB each. Duplicate files are ignored. Unsupported codecs and damaged files produce a recoverable message.

The player supports play/pause, previous/next, seeking after metadata loads, volume, queue repeat and removal. Adding music preserves current playback. Choosing a different source stops the previous one. Removing files or unmounting releases their object URLs; stale media events and rejected play promises cannot restart a previous source.

For public full-length tracks, put audio you are allowed to publish in `public/music/` and add entries to `featuredTracks` in `src/data/music.ts` with `id`, `title`, `artist` and same-origin `src` (for example `/music/evening.mp3`). Actual files are required; there are no placeholder downloads.

## Verification

Automated tests cover saved collections, migration, validation, duplicates, blocked storage, default selections, native queues and cleanup, playback-driven animation, source handoff, stale frame/media events, retry, Spotify SDK intent/readiness/timeout handling, and desktop isolation configuration.

Audio and Spotify are mocked in these tests. Actual sound, codec support, provider availability, iframe/autoplay behavior and device layouts still need live browser acceptance. Verify the tonearm, playback, queue completion, interrupted connections and local files on desktop and mobile, and confirm Terminal still boots with Spotify open.

References:

- [Spotify iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api)
- [Spotify embed troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting)
- [Spotify widget requirements](https://developer.spotify.com/documentation/embeds/terms)
- [MDN credentialless iframes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/IFrame_credentialless)
