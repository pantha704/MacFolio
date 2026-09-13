export type SpotifySource = { title: string; url: string }
export type AudioTrack = {
  id: string
  title: string
  artist: string
  src: string
  local?: boolean
}

/** Only canonical Spotify content URLs are embedded; pasted HTML and lookalike hosts are rejected. */
export function spotifySource(value: string) {
  let kind: string | undefined, id: string | undefined
  const uri = /^spotify:(track|album|playlist|artist):([a-zA-Z0-9]{22})$/.exec(
    value.trim(),
  )
  if (uri) [, kind, id] = uri
  else {
    try {
      const url = new URL(value.trim())
      if (
        url.protocol !== 'https:' ||
        url.hostname !== 'open.spotify.com' ||
        url.username ||
        url.password ||
        url.port
      )
        return null
      const match =
        /^\/(?:intl-[a-zA-Z-]+\/)?(?:embed\/)?(track|album|playlist|artist)\/([a-zA-Z0-9]{22})\/?$/.exec(
          url.pathname,
        )
      if (!match) return null
      ;[, kind, id] = match
    } catch {
      return null
    }
  }
  return {
    kind,
    id,
    url: `https://open.spotify.com/${kind}/${id}`,
    embed: `https://open.spotify.com/embed/${kind}/${id}?theme=0`,
  }
}
export const acceptsAudio = (file: Pick<File, 'name' | 'type' | 'size'>) =>
  file.size > 0 &&
  file.size <= 100 * 1024 * 1024 &&
  (file.type.startsWith('audio/') ||
    /\.(mp3|m4a|ogg|oga|wav|flac|aac|webm)$/i.test(file.name))
export function displayTime(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}
