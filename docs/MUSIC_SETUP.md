# Listening room

The right-side app shortcuts have been replaced by a persistent music card. All apps remain in the Dock. Music starts after visitor interaction; opening or minimizing an app does not unload the local audio player.

No default songs or playlist have been supplied yet. The card invites visitors to choose music until the owner configures a public selection.

## Publish a Spotify selection

Edit `src/data/music.ts` and set `featuredSpotify` to your public track, album, artist or playlist URL:

```ts
export const featuredSpotify: SpotifySource | null = {
  title: 'My evening rotation',
  url: 'PASTE_YOUR_SPOTIFY_SHARE_LINK_HERE',
}
```

Use Spotify’s **Share → Copy link** option, not an iframe HTML snippet. Publish the code change to make this the default for visitors. No API key or OAuth setup is required. Until a valid URL is supplied, the local music view remains available.

The card loads Spotify’s official embed only when **Load Spotify player** is pressed. Spotify controls playback, and embeds may offer only previews depending on the browser/session and content. **Open Spotify** is always available. This integration does not use the Web Playback SDK, which requires Spotify Premium.

The real terminal needs the existing cross-origin isolation headers in `vercel.json`. Keep them. On an isolated page, supported browsers use a credentialless iframe; this has separate storage/cookies, so an existing Spotify sign-in is not shared. Browsers without that support offer the external Spotify link and local-file playback instead. Do not weaken the terminal headers to force an embed.

Links saved through **Choose music** are personal preferences in that visitor’s browser. They do not change the owner’s public playlist or publish anything to Spotify. Invalid URLs, lookalike domains, unsupported content types and pasted HTML are rejected.

## Publish full audio tracks

For full playback with the custom controls, use audio you are allowed to publish. Put the files in `public/music/`, then edit the queue in `src/data/music.ts`:

```ts
export const featuredTracks: AudioTrack[] = [
  {
    id: 'evening-demo',
    title: 'Evening Demo',
    artist: 'Your artist name',
    src: '/music/evening-demo.mp3',
  },
]
```

This example requires the actual file. The repository does not include placeholder or downloaded commercial songs. Prefer same-origin files so playback works with the terminal’s isolation headers. Files are served by the existing hosting project; there is no new music-service subscription, although normal hosting transfer limits still apply.

The first configured track is selected without autoplay. If both a Spotify default and a file queue are configured, the card initially shows Spotify; **Choose music** also lists the file queue.

## Listen to files on this device

Open **Choose music → Add audio**, or drop audio into the dialog. Files are not uploaded and last for this page visit. Supported browser codecs include common MP3, M4A, Ogg, WAV and FLAC files. Imports are capped at 50 tracks and 100 MB per file; duplicates are ignored. A codec or damaged-file failure produces a recoverable message.

The local player supports play/pause, previous/next, seeking after metadata loads, volume, queue repeat and removal. Adding more files preserves current playback. Switching to Spotify stops local playback; switching back removes the Spotify iframe. Removing a local file or unmounting the player releases its object URL. No files are downloaded from Spotify.

## Verification

Automated DOM tests mock the audio API and verify queue behavior, source handoff, stale playback events/rejections, seek/volume state, error recovery, dialog keyboard isolation, preference persistence, iframe capability checks and file cleanup. They do not prove actual audio output, codec support, browser autoplay behavior or Spotify’s service availability.

Before release, try an actual MP3 and a real public Spotify playlist in desktop Chrome, Safari, Firefox and an Android/iOS browser. Test an interrupted network, end-of-queue, source switching, device volume, background playback, and the compact portrait/landscape layouts. Confirm that Terminal still boots under the unchanged response headers.

References:

- [Spotify: creating an embed](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed)
- [Spotify: troubleshooting embeds and previews](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting)
- [Spotify: Web Playback SDK requirements](https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started)
- [MDN: credentialless iframes](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/credentialless)
