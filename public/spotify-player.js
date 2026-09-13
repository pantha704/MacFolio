// The official SDK runs in this credentialless child document. The desktop
// keeps COOP/COEP for its Node terminal. No private Spotify message protocol.
;(() => {
  const params = new URLSearchParams(location.hash.slice(1))
  const uri = params.get('uri'),
    session = params.get('session')
  if (
    !/^spotify:(track|album|playlist|artist):[A-Za-z0-9]{22}$/.test(
      uri ?? '',
    ) ||
    !session ||
    parent === window
  )
    return
  let controller,
    ready = false,
    wanted = false,
    playbackTimer
  const send = (type, data = {}) =>
    parent.postMessage(
      { channel: 'macfolio-spotify', session, type, ...data },
      location.origin,
    )
  const reportError = () => {
    clearTimeout(loadTimer)
    clearTimeout(playbackTimer)
    send('error')
  }
  const applyIntent = () => {
    if (!ready || !controller) return
    clearTimeout(playbackTimer)
    try {
      if (wanted) {
        controller.resume()
        // Autoplay can be declined without an SDK error. Leave the real controls
        // visible, return the arm to rest and let the visitor press Spotify Play.
        playbackTimer = setTimeout(() => send('interaction-required'), 5000)
      } else controller.pause()
    } catch {
      reportError()
    }
  }
  window.addEventListener('message', (event) => {
    const data = event.data
    if (
      event.source !== parent ||
      event.origin !== location.origin ||
      data?.channel !== 'macfolio-spotify' ||
      data.session !== session
    )
      return
    if (data.type === 'play' || data.type === 'pause') {
      wanted = data.type === 'play'
      applyIntent()
    }
  })
  const loadTimer = setTimeout(reportError, 15000)
  window.onSpotifyIframeApiReady = (api) => {
    try {
      api.createController(
        document.getElementById('embed'),
        { uri, width: '100%', height: 152 },
        (instance) => {
          controller = instance
          instance.addListener('ready', () => {
            clearTimeout(loadTimer)
            ready = true
            send('ready')
            applyIntent()
          })
          instance.addListener('playback_update', (event) => {
            const state = event.data
            if (
              !state ||
              typeof state.isPaused !== 'boolean' ||
              typeof state.isBuffering !== 'boolean'
            )
              return
            // A playlist may legitimately move to a track URI. A single track may not.
            if (
              uri.startsWith('spotify:track:') &&
              state.playingURI &&
              state.playingURI !== uri
            )
              return
            if (!state.isPaused && !state.isBuffering)
              clearTimeout(playbackTimer)
            send('playback', {
              paused: state.isPaused,
              buffering: state.isBuffering,
              position: Number.isFinite(state.position)
                ? Math.max(0, state.position)
                : 0,
              duration: Number.isFinite(state.duration)
                ? Math.max(0, state.duration)
                : 0,
            })
          })
        },
      )
    } catch {
      reportError()
    }
  }
  const script = document.createElement('script')
  script.src = 'https://open.spotify.com/embed/iframe-api/v1'
  script.async = true
  script.onerror = reportError
  document.head.append(script)
  window.addEventListener(
    'pagehide',
    () => {
      clearTimeout(loadTimer)
      clearTimeout(playbackTimer)
      controller?.destroy()
    },
    { once: true },
  )
})()
