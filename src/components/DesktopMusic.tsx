import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Disc3,
  ExternalLink,
  Headphones,
  Music2,
  Pause,
  Play,
  Plus,
  Repeat2,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  X,
} from 'lucide-react'
import { featuredSpotify, featuredTracks } from '../data/music'
import {
  acceptsAudio,
  displayTime,
  spotifySource,
  type AudioTrack,
  type SpotifySource,
} from '../music/sources'
import { safeSave, safeStorage } from '../utils/storage'
import '../music/music.css'

function readSpotify(): SpotifySource | null {
  try {
    const saved = JSON.parse(
      safeStorage.getItem('macfolio-music-spotify') ?? 'null',
    )
    if (
      saved &&
      typeof saved.title === 'string' &&
      typeof saved.url === 'string' &&
      spotifySource(saved.url)
    )
      return {
        title: saved.title.slice(0, 80),
        url: spotifySource(saved.url)!.url,
      }
  } catch {
    /* A corrupt preference does not prevent local playback. */
  }
  return featuredSpotify && spotifySource(featuredSpotify.url)
    ? featuredSpotify
    : null
}
function LibraryDialog({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const node = dialog.current
    node?.showModal()
    return () => {
      node?.close()
      previous?.focus({ preventScroll: true })
    }
  }, [])
  return createPortal(
    <dialog
      className="music-library"
      ref={dialog}
      aria-labelledby="music-library-title"
      onCancel={onClose}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <header>
        <div>
          <span className="music-eyebrow">MAKE YOURSELF AT HOME</span>
          <h2 id="music-library-title">Your soundtrack.</h2>
        </div>
        <button onClick={onClose} aria-label="Close music library">
          <X size={19} />
        </button>
      </header>
      {children}
    </dialog>,
    document.body,
  )
}

export default function DesktopMusic() {
  const audio = useRef<HTMLAudioElement>(null),
    picker = useRef<HTMLInputElement>(null)
  const urls = useRef(new Set<string>()),
    request = useRef({ version: 0, active: false })
  const [tracks, setTracks] = useState<AudioTrack[]>(featuredTracks)
  const [selected, setSelected] = useState<string | null>(
    featuredTracks[0]?.id ?? null,
  )
  const [spotify, setSpotify] = useState(readSpotify)
  const [source, setSource] = useState<'files' | 'spotify'>(() =>
    spotify ? 'spotify' : 'files',
  )
  const [connected, setConnected] = useState(false),
    [library, setLibrary] = useState(false)
  const [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false)
  const [position, setPosition] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(0.65)
  const [repeat, setRepeat] = useState(false),
    [notice, setNotice] = useState('')
  const [link, setLink] = useState(spotify?.url ?? ''),
    [title, setTitle] = useState(spotify?.title ?? '')
  const track = tracks.find((item) => item.id === selected)
  const entity = spotify ? spotifySource(spotify.url) : null
  const isolated = globalThis.crossOriginIsolated === true
  const canEmbed = !isolated || 'credentialless' in HTMLIFrameElement.prototype
  useEffect(() => {
    const player = audio.current,
      owned = urls.current,
      session = request.current
    if (player) player.volume = 0.65
    return () => {
      session.version++
      session.active = false
      player?.pause()
      player?.removeAttribute('src')
      player?.load()
      owned.forEach((url) => URL.revokeObjectURL(url))
      owned.clear()
    }
  }, [])
  const stop = () => {
    request.current.version++
    request.current.active = false
    audio.current?.pause()
    setPlaying(false)
    setBusy(false)
  }
  const play = (item = track) => {
    const player = audio.current
    if (!player || !item) return
    setSource('files')
    setConnected(false)
    setNotice('')
    setSelected(item.id)
    const token = ++request.current.version
    request.current.active = true
    if (player.dataset.track !== item.id) {
      player.pause()
      player.src = item.src
      player.dataset.track = item.id
      player.load()
      setPosition(0)
      setDuration(0)
    }
    setBusy(true)
    void player.play().catch((error) => {
      if (request.current.version !== token) return
      request.current.active = false
      setPlaying(false)
      setBusy(false)
      setNotice(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Press play again to allow audio in this browser.'
          : 'This track could not play. Try another audio file.',
      )
    })
  }
  const skip = (direction: number, automatic = false) => {
    const index = tracks.findIndex((item) => item.id === selected)
    if (!tracks.length) return
    if (automatic && index === tracks.length - 1 && !repeat) {
      stop()
      return
    }
    play(tracks[(index + direction + tracks.length) % tracks.length])
  }
  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return
    const additions: AudioTrack[] = []
    let skipped = 0
    const existing = new Set(tracks.map((item) => item.id))
    for (const file of Array.from(files)) {
      const id = `${file.name}:${file.size}:${file.lastModified}`
      if (existing.has(id)) continue
      if (!acceptsAudio(file) || tracks.length + additions.length >= 50) {
        skipped++
        continue
      }
      const src = URL.createObjectURL(file)
      urls.current.add(src)
      existing.add(id)
      additions.push({
        id,
        src,
        title: file.name.replace(/\.[^.]+$/, '').replaceAll('_', ' '),
        artist: 'On this device',
        local: true,
      })
    }
    if (additions.length) {
      setTracks([...tracks, ...additions])
      if (!selected) setSelected(additions[0].id)
      if (source === 'spotify') stop()
      setSource('files')
      setConnected(false)
    }
    setNotice(
      skipped
        ? `${skipped} file${skipped === 1 ? '' : 's'} skipped. Choose audio under 100 MB, up to 50 tracks.`
        : additions.length
          ? playing
            ? 'Added to your queue.'
            : 'Music added. Press play when you’re ready.'
          : 'These tracks are already in your queue.',
    )
  }
  const remove = (item: AudioTrack) => {
    const next = tracks.filter((entry) => entry.id !== item.id)
    if (selected === item.id) {
      stop()
      audio.current?.removeAttribute('src')
      audio.current?.load()
      if (audio.current) delete audio.current.dataset.track
      setSelected(next[0]?.id ?? null)
      setPosition(0)
      setDuration(0)
    }
    setTracks(next)
    if (urls.current.delete(item.src)) URL.revokeObjectURL(item.src)
  }
  const saveSpotify = (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = spotifySource(link)
    if (!parsed) {
      setNotice('Paste a Spotify track, album, artist or playlist link.')
      return
    }
    const next = {
      url: parsed.url,
      title: title.trim().slice(0, 80) || `My Spotify ${parsed.kind}`,
    }
    setSpotify(next)
    stop()
    setSource('spotify')
    setConnected(false)
    setLibrary(false)
    setNotice(
      safeSave('macfolio-music-spotify', JSON.stringify(next))
        ? ''
        : 'Available for this visit. Your browser could not save the link.',
    )
  }
  return (
    <>
      <aside
        className={`desktop-music${playing && source === 'files' ? ' is-playing' : ''}`}
        aria-label="Music player"
      >
        <header className="music-card-header">
          <span>
            <Headphones size={13} /> LISTENING ROOM
          </span>
          <button
            onClick={() => setLibrary(true)}
            aria-label="Choose music"
            title="Choose music"
          >
            <Plus size={18} />
          </button>
        </header>
        {source === 'spotify' && entity ? (
          <div className="music-spotify">
            <h2>{spotify?.title}</h2>
            {connected && canEmbed ? (
              <iframe
                key={entity.url}
                {...(isolated ? { credentialless: '' } : {})}
                src={entity.embed}
                title={`Spotify player: ${spotify?.title}`}
                height="152"
                width="100%"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="spotify-placeholder">
                <Disc3 size={34} />
                <p>A little music for the view.</p>
                {canEmbed && (
                  <button
                    className="music-primary"
                    onClick={() => {
                      stop()
                      setConnected(true)
                    }}
                  >
                    Load Spotify player
                  </button>
                )}
              </div>
            )}
            <div className="spotify-actions">
              <a href={entity.url} target="_blank" rel="noopener noreferrer">
                Open Spotify <ExternalLink size={12} />
              </a>
              {connected && (
                <button onClick={() => setConnected(false)}>Stop player</button>
              )}
            </div>
            <p className="music-note">
              {canEmbed
                ? 'Spotify controls playback; previews may be limited.'
                : 'Listen on Spotify in this browser, or choose your own audio files.'}
            </p>
          </div>
        ) : (
          <>
            <div className="music-now">
              <div className="music-sleeve" aria-hidden="true">
                <div className="music-record">
                  <i />
                  <Music2 size={23} />
                </div>
              </div>
              <div>
                <span className="music-eyebrow">
                  {track ? 'YOUR ROTATION' : 'A LITTLE COMPANY'}
                </span>
                <h2>{track?.title || 'Stay a little longer.'}</h2>
                <p>{track?.artist || 'Bring your favourite sounds.'}</p>
              </div>
            </div>
            {track ? (
              <>
                <div className="music-timeline">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={Math.min(position, duration || 0)}
                    disabled={!duration}
                    aria-label="Track position"
                    onChange={(e) => {
                      if (audio.current && duration) {
                        audio.current.currentTime = Number(e.target.value)
                        setPosition(Number(e.target.value))
                      }
                    }}
                  />
                  <div>
                    <span>{displayTime(position)}</span>
                    <span>{displayTime(duration)}</span>
                  </div>
                </div>
                <div className="music-controls">
                  <button
                    onClick={() => skip(-1)}
                    disabled={tracks.length < 2}
                    aria-label="Previous track"
                  >
                    <SkipBack size={18} />
                  </button>
                  <button
                    className="music-play"
                    onClick={() => (playing || busy ? stop() : play())}
                    aria-label={playing || busy ? 'Pause music' : 'Play music'}
                  >
                    {playing || busy ? <Pause size={21} /> : <Play size={21} />}
                  </button>
                  <button
                    onClick={() => skip(1)}
                    disabled={tracks.length < 2}
                    aria-label="Next track"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>
                <div className="music-volume">
                  <Volume2 size={14} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    aria-label="Music volume"
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setVolume(value)
                      if (audio.current) audio.current.volume = value
                    }}
                  />
                  <button
                    aria-label="Repeat queue"
                    aria-pressed={repeat}
                    onClick={() => setRepeat(!repeat)}
                  >
                    <Repeat2 size={16} />
                  </button>
                </div>
              </>
            ) : (
              <button
                className="music-primary music-empty-action"
                onClick={() => setLibrary(true)}
              >
                Choose your music <Plus size={14} />
              </button>
            )}
            <footer className="music-card-footer">
              <span>
                {busy
                  ? 'Loading audio…'
                  : track
                    ? `${tracks.length} track${tracks.length === 1 ? '' : 's'} · ${playing ? 'Playing' : 'Ready when you are'}`
                    : 'Spotify links or your own files'}
              </span>
              {track && <button onClick={() => setLibrary(true)}>Queue</button>}
            </footer>
          </>
        )}
        {!library && notice && (
          <p className="music-note" role="status">
            {notice}
          </p>
        )}
      </aside>
      <audio
        ref={audio}
        preload="metadata"
        crossOrigin="anonymous"
        onPlaying={(event) => {
          if (!request.current.active) {
            event.currentTarget.pause()
            return
          }
          setPlaying(true)
          setBusy(false)
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => {
          if (request.current.active) setBusy(true)
        }}
        onCanPlay={() => setBusy(false)}
        onEnded={() => {
          if (request.current.active) skip(1, true)
        }}
        onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) =>
          setDuration(
            Number.isFinite(e.currentTarget.duration)
              ? e.currentTarget.duration
              : 0,
          )
        }
        onDurationChange={(e) =>
          setDuration(
            Number.isFinite(e.currentTarget.duration)
              ? e.currentTarget.duration
              : 0,
          )
        }
        onError={() => {
          if (!request.current.active) return
          stop()
          setNotice('This audio could not load. Try another file or format.')
        }}
      />
      {library && (
        <LibraryDialog onClose={() => setLibrary(false)}>
          <section
            className="music-file-section"
            aria-labelledby="music-files-title"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              addFiles(e.dataTransfer.files)
            }}
          >
            <div className="music-section-title">
              <div>
                <h3 id="music-files-title">Your files</h3>
                <p>
                  Drop audio here. Files stay on this device for this visit.
                </p>
              </div>
              <button
                className="music-primary"
                onClick={() => picker.current?.click()}
              >
                Add audio
              </button>
            </div>
            <input
              ref={picker}
              type="file"
              accept="audio/*,.mp3,.m4a,.ogg,.wav,.flac"
              multiple
              hidden
              aria-label="Audio files"
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            {tracks.length ? (
              <ol className="music-queue">
                {tracks.map((item, i) => (
                  <li
                    key={item.id}
                    className={
                      selected === item.id && source === 'files'
                        ? 'is-selected'
                        : ''
                    }
                  >
                    <button
                      onClick={() => {
                        play(item)
                        setLibrary(false)
                      }}
                      aria-label={`Play ${item.title}`}
                    >
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.artist}</small>
                      </div>
                      <Play size={14} />
                    </button>
                    <button
                      aria-label={`Remove ${item.title}`}
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="music-note">
                MP3, M4A, Ogg, WAV and other formats supported by your browser.
              </p>
            )}
          </section>
          <section
            className="music-link-section"
            aria-labelledby="music-spotify-title"
          >
            <h3 id="music-spotify-title">From Spotify</h3>
            <p>Use a shared track, album, artist or playlist link.</p>
            <form onSubmit={saveSpotify}>
              <label>
                Spotify link
                <input
                  type="text"
                  inputMode="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/…"
                  required
                />
              </label>
              <label>
                Name <span>(optional)</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder="My late-night rotation"
                />
              </label>
              <button className="music-primary" type="submit">
                Use Spotify link
              </button>
            </form>
            {entity && (
              <button
                className="music-saved"
                onClick={() => {
                  stop()
                  setSource('spotify')
                  setLibrary(false)
                }}
              >
                Return to {spotify?.title}
              </button>
            )}
            <p className="music-note">
              No API key needed. Spotify may offer previews; use Open Spotify
              for its full listening experience. Your saved link is personal to
              this browser.
            </p>
          </section>
          {notice && (
            <p className="music-notice" role="status">
              {notice}
            </p>
          )}
        </LibraryDialog>
      )}
    </>
  )
}
