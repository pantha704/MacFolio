import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { spotifySource, type SpotifySource } from './sources'

export type SpotifyPlayback = {
  playing: boolean
  buffering: boolean
  position: number
  duration: number
}
export type PlaybackIntent = { serial: number; play: boolean }

export default function SpotifyPlayer({
  source,
  intent,
  onPlayback,
  onNotice,
}: {
  source: SpotifySource
  intent: PlaybackIntent
  onPlayback: (state: SpotifyPlayback) => void
  onNotice: (message: string) => void
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [session] = useState(() =>
    Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
      value.toString(16).padStart(8, '0'),
    ).join(''),
  )
  const entity = spotifySource(source.url)!
  const isolated = globalThis.crossOriginIsolated === true
  const handlePlayback = useEffectEvent(onPlayback)
  const handleNotice = useEffectEvent(onNotice)
  const sendIntent = () =>
    frame.current?.contentWindow?.postMessage(
      {
        channel: 'macfolio-spotify',
        session,
        type: intent.play ? 'play' : 'pause',
      },
      window.location.origin,
    )

  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayback({
        playing: false,
        buffering: false,
        position: 0,
        duration: 0,
      })
      handleNotice(
        'Spotify could not connect. Retry, or open this selection on Spotify.',
      )
    }, 18000)
    const receive = (event: MessageEvent) => {
      const data = event.data
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== window.location.origin ||
        data?.channel !== 'macfolio-spotify' ||
        data.session !== session
      )
        return
      if (data.type === 'ready') {
        clearTimeout(timer)
        handleNotice('')
      } else if (
        data.type === 'playback' &&
        typeof data.paused === 'boolean' &&
        typeof data.buffering === 'boolean'
      ) {
        clearTimeout(timer)
        handlePlayback({
          playing: !data.paused && !data.buffering,
          buffering: data.buffering,
          position: Number.isFinite(data.position)
            ? Math.max(0, data.position / 1000)
            : 0,
          duration: Number.isFinite(data.duration)
            ? Math.max(0, data.duration / 1000)
            : 0,
        })
        if (!data.paused && !data.buffering) handleNotice('')
      } else if (
        data.type === 'interaction-required' ||
        data.type === 'error'
      ) {
        clearTimeout(timer)
        handlePlayback({
          playing: false,
          buffering: false,
          position: 0,
          duration: 0,
        })
        handleNotice(
          data.type === 'error'
            ? 'Spotify could not connect. Retry, or open this selection on Spotify.'
            : 'Press play in the Spotify controls to start listening.',
        )
      }
    }
    window.addEventListener('message', receive)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('message', receive)
    }
  }, [session])
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      {
        channel: 'macfolio-spotify',
        session,
        type: intent.play ? 'play' : 'pause',
      },
      window.location.origin,
    )
  }, [intent, session])

  return (
    <iframe
      ref={frame}
      {...(isolated ? { credentialless: '' } : {})}
      src={`/spotify-player.html#${new URLSearchParams({ uri: `spotify:${entity.kind}:${entity.id}`, session })}`}
      onLoad={sendIntent}
      title={`Spotify player: ${source.title}`}
      height="152"
      width="100%"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
    />
  )
}
