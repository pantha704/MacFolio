import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ExternalLink,
  ListMusic,
  Pause,
  Play,
  Plus,
  Repeat2,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
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
import {
  readCollection,
  saveCollection,
  type MusicCollection,
} from '../music/collection'
import SpotifyPlayer, {
  type PlaybackIntent,
  type SpotifyPlayback,
} from '../music/SpotifyPlayer'
import '../music/music.css'

function LibraryDialog({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null,
      node = dialog.current
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
          <span className="music-eyebrow">A SOUNDTRACK FOR THE VIEW</span>
          <h2 id="music-library-title">The record shelf.</h2>
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

function Record({
  playing,
  busy,
  onPlay,
}: {
  playing: boolean
  busy: boolean
  onPlay: () => void
}) {
  const metal = useId()
  return (
    <div className="turntable">
      <button
        className="record-button"
        onClick={onPlay}
        aria-label={playing || busy ? 'Pause music' : 'Play music'}
      >
        <span className="vinyl" aria-hidden="true">
          <span className="record-label">
            <span>STILLWATER</span>
            <i />
            <small>SIDE A · 33⅓</small>
          </span>
        </span>
        <span className="record-action" aria-hidden="true">
          {playing || busy ? (
            <Pause size={19} fill="currentColor" />
          ) : (
            <Play size={19} fill="currentColor" />
          )}
        </span>
      </button>
      <svg className="tonearm" viewBox="0 0 180 190" aria-hidden="true">
        <defs>
          <linearGradient id={metal} x1="0" x2="1">
            <stop offset="0" stopColor="#75838a" />
            <stop offset=".32" stopColor="#ecede8" />
            <stop offset=".56" stopColor="#afb9bb" />
            <stop offset=".8" stopColor="#f8f4e9" />
            <stop offset="1" stopColor="#677880" />
          </linearGradient>
        </defs>
        <circle
          cx="153"
          cy="27"
          r="14"
          fill="#101d24"
          stroke="#d4e1dd"
          strokeOpacity=".18"
        />
        <g className="tonearm-moving">
          <rect
            x="146"
            y="10"
            width="14"
            height="23"
            rx="4"
            fill={`url(#${metal})`}
            stroke="#263b43"
          />
          <path
            d="M153 27V96Q153 108 144 117L121 141"
            fill="none"
            stroke="#0a1218"
            strokeWidth="8"
          />
          <path
            d="M153 27V96Q153 108 144 117L121 141"
            fill="none"
            stroke={`url(#${metal})`}
            strokeWidth="5"
          />
          <path d="M121 140l-8 12" stroke="#d2d4c7" strokeWidth="2" />
          <rect
            x="116"
            y="131"
            width="10"
            height="22"
            rx="2"
            transform="rotate(36 121 141)"
            fill="#27353b"
            stroke="#a6b5b7"
            strokeWidth="1.5"
          />
        </g>
        <circle
          cx="153"
          cy="27"
          r="8"
          fill={`url(#${metal})`}
          stroke="#40515a"
        />
        <circle cx="153" cy="27" r="2.5" fill="#46585e" />
      </svg>
    </div>
  )
}

export default function DesktopMusic() {
  const audio = useRef<HTMLAudioElement>(null),
    picker = useRef<HTMLInputElement>(null)
  const urls = useRef(new Set<string>()),
    request = useRef({ version: 0, active: false })
  const spotifyPlayed = useRef(false)
  const [tracks, setTracks] = useState<AudioTrack[]>(featuredTracks)
  const [selected, setSelected] = useState<string | null>(
    featuredTracks[0]?.id ?? null,
  )
  const [collection, setCollection] = useState(readCollection)
  const [source, setSource] = useState<'files' | 'spotify'>('spotify')
  const [connected, setConnected] = useState(false),
    [library, setLibrary] = useState(false),
    [details, setDetails] = useState(false)
  const [intent, setIntent] = useState<PlaybackIntent>({
      serial: 0,
      play: false,
    }),
    [revision, setRevision] = useState(0)
  const [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(false)
  const [position, setPosition] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(0.65)
  const [repeat, setRepeat] = useState(false),
    [notice, setNotice] = useState('')
  const [link, setLink] = useState(''),
    [title, setTitle] = useState('')
  const track = tracks.find((item) => item.id === selected)
  const spotifyQueue = [...featuredSpotify, ...collection.items]
  const spotify =
    spotifyQueue.find((item) => item.url === collection.selected) ??
    featuredSpotify[0]
  const current = source === 'spotify' ? spotify : track
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
  const persist = (next: MusicCollection) => {
    setCollection(next)
    if (!saveCollection(next))
      setNotice(
        'Available for this visit. Your browser could not save the collection.',
      )
  }
  const stopLocal = () => {
    request.current.version++
    request.current.active = false
    audio.current?.pause()
    setPlaying(false)
    setBusy(false)
  }
  const stop = () => {
    stopLocal()
    setIntent((value) => ({ serial: value.serial + 1, play: false }))
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
  const playSpotify = (item = spotify) => {
    stopLocal()
    setNotice('')
    spotifyPlayed.current = false
    setSource('spotify')
    setDetails(false)
    setPosition(0)
    setDuration(0)
    if (collection.selected !== item.url)
      persist({ ...collection, selected: item.url })
    setConnected(true)
    if (canEmbed) {
      setBusy(true)
      setIntent((value) => ({ serial: value.serial + 1, play: true }))
    }
  }
  const skip = (direction: number, automatic = false) => {
    if (source === 'spotify') {
      const index = spotifyQueue.findIndex((item) => item.url === spotify.url)
      if (automatic && index === spotifyQueue.length - 1 && !repeat) {
        stop()
        return
      }
      playSpotify(
        spotifyQueue[
          (index + direction + spotifyQueue.length) % spotifyQueue.length
        ],
      )
    } else {
      const index = tracks.findIndex((item) => item.id === selected)
      if (!tracks.length) return
      if (automatic && index === tracks.length - 1 && !repeat) {
        stop()
        return
      }
      play(tracks[(index + direction + tracks.length) % tracks.length])
    }
  }
  const spotifyState = (state: SpotifyPlayback) => {
    setPlaying(state.playing)
    setBusy(state.buffering)
    setPosition(state.position)
    setDuration(state.duration)
    if (state.playing) spotifyPlayed.current = true
    if (
      spotifySource(spotify.url)?.kind === 'track' &&
      spotifyPlayed.current &&
      intent.play &&
      !state.playing &&
      !state.buffering &&
      state.duration > 0 &&
      state.position >= state.duration - 0.25
    ) {
      spotifyPlayed.current = false
      skip(1, true)
    }
  }
  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return
    const additions: AudioTrack[] = [],
      existing = new Set(tracks.map((item) => item.id))
    let skipped = 0
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
      if (source === 'spotify' && !playing && !busy) {
        setSource('files')
        setConnected(false)
      }
    }
    setNotice(
      skipped
        ? `${skipped} file${skipped === 1 ? '' : 's'} skipped. Choose audio under 100 MB, up to 50 tracks.`
        : additions.length
          ? 'Added to your queue. Choose a track when you’re ready.'
          : 'These tracks are already in your queue.',
    )
  }
  const remove = (item: AudioTrack) => {
    const next = tracks.filter((entry) => entry.id !== item.id)
    if (selected === item.id) {
      if (source === 'files') stop()
      audio.current?.removeAttribute('src')
      audio.current?.load()
      if (audio.current) delete audio.current.dataset.track
      setSelected(next[0]?.id ?? null)
      if (source === 'files') {
        setPosition(0)
        setDuration(0)
        if (!next.length) setSource('spotify')
      }
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
    if (spotifyQueue.some((item) => item.url === parsed.url)) {
      setNotice('This selection is already on your record shelf.')
      return
    }
    if (collection.items.length >= 100) {
      setNotice('Your shelf is full. Remove a selection before adding another.')
      return
    }
    const next = {
      url: parsed.url,
      title: title.trim().slice(0, 80) || `My Spotify ${parsed.kind}`,
    }
    setNotice('Saved to your record shelf.')
    setLink('')
    setTitle('')
    persist({ ...collection, items: [...collection.items, next] })
  }
  const removeSpotify = (item: SpotifySource) => {
    if (collection.selected === item.url && source === 'spotify') {
      stop()
      setConnected(false)
    }
    persist({
      items: collection.items.filter((entry) => entry.url !== item.url),
      selected:
        collection.selected === item.url
          ? featuredSpotify[0].url
          : collection.selected,
    })
  }
  const spotifyList = (items: SpotifySource[], removable = false) => (
    <ol className="music-queue">
      {items.map((item, i) => (
        <li
          key={item.url}
          className={
            source === 'spotify' && spotify.url === item.url
              ? 'is-selected'
              : ''
          }
        >
          <button
            onClick={() => {
              playSpotify(item)
              setLibrary(false)
            }}
            aria-label={`Play ${item.title}`}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.artist || `Spotify ${spotifySource(item.url)?.kind}`}
              </small>
            </div>
            <Play size={14} />
          </button>
          {removable && (
            <button
              aria-label={`Remove ${item.title}`}
              onClick={() => removeSpotify(item)}
            >
              <Trash2 size={15} />
            </button>
          )}
        </li>
      ))}
    </ol>
  )

  return (
    <>
      <aside
        className={`desktop-music${playing ? ' is-playing' : ''}${source === 'spotify' && connected ? ' has-spotify' : ''}`}
        aria-label="Music player"
      >
        <Record
          playing={playing}
          busy={busy}
          onPlay={() =>
            playing || busy
              ? stop()
              : source === 'spotify'
                ? playSpotify()
                : play()
          }
        />
        <div className="record-caption">
          <span className="music-eyebrow">
            {busy
              ? 'CONNECTING…'
              : playing
                ? 'NOW SPINNING'
                : 'PRESS THE RECORD TO PLAY'}
          </span>
          <h2 title={current?.title}>{current?.title || 'A little quiet.'}</h2>
          <p>
            {current?.artist ||
              (source === 'spotify'
                ? 'Your Spotify selection'
                : 'Add a favourite to the shelf')}
          </p>
        </div>
        <div className="record-controls">
          <button
            onClick={() => skip(-1)}
            disabled={source === 'files' && tracks.length < 2}
            aria-label="Previous track"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => setLibrary(true)}
            aria-label="Choose music"
            title="Record shelf"
          >
            <ListMusic size={19} />
          </button>
          <button
            onClick={() => skip(1)}
            disabled={source === 'files' && tracks.length < 2}
            aria-label="Next track"
          >
            <SkipForward size={15} />
          </button>
          {source === 'files' && (
            <button
              onClick={() => setDetails(!details)}
              aria-label="Playback settings"
              aria-expanded={details}
            >
              <SlidersHorizontal size={16} />
            </button>
          )}
        </div>
        {source === 'files' && details && (
          <div className="record-details">
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
          </div>
        )}
        {source === 'spotify' &&
          connected &&
          createPortal(
            <div className="spotify-panel" aria-label="Spotify controls">
              <div className="spotify-panel-header">
                <span>LISTEN ON SPOTIFY</span>
                <button
                  onClick={() => {
                    stop()
                    setConnected(false)
                    setNotice('')
                  }}
                  aria-label="Close Spotify player"
                >
                  <X size={16} />
                </button>
              </div>
              {!library && notice && (
                <p className="music-notice" role="status">
                  {notice}
                </p>
              )}
              {canEmbed ? (
                <SpotifyPlayer
                  key={`${spotify.url}:${revision}`}
                  source={spotify}
                  intent={intent}
                  onPlayback={spotifyState}
                  onNotice={setNotice}
                />
              ) : (
                <p className="music-note">
                  Listen on Spotify in this browser, or add your own audio
                  files.
                </p>
              )}
              <div className="spotify-actions">
                <a href={spotify.url} target="_blank" rel="noopener noreferrer">
                  Open Spotify <ExternalLink size={12} />
                </a>
                {canEmbed && (
                  <button
                    onClick={() => {
                      stop()
                      setRevision((value) => value + 1)
                      playSpotify()
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>
              <p className="music-note">
                Spotify may play previews. Close this panel to stop.
              </p>
            </div>,
            document.body,
          )}
        {!library && notice && !(source === 'spotify' && connected) && (
          <p className="music-notice" role="status">
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
        onPause={() => {
          if (request.current.active) setPlaying(false)
        }}
        onWaiting={() => {
          if (request.current.active) {
            setBusy(true)
            setPlaying(false)
          }
        }}
        onCanPlay={() => {
          if (request.current.active) setBusy(false)
        }}
        onEnded={() => {
          if (request.current.active) skip(1, true)
        }}
        onTimeUpdate={(e) => {
          if (request.current.active) setPosition(e.currentTarget.currentTime)
        }}
        onLoadedMetadata={(e) => {
          if (request.current.active)
            setDuration(
              Number.isFinite(e.currentTarget.duration)
                ? e.currentTarget.duration
                : 0,
            )
        }}
        onDurationChange={(e) => {
          if (request.current.active)
            setDuration(
              Number.isFinite(e.currentTarget.duration)
                ? e.currentTarget.duration
                : 0,
            )
        }}
        onError={() => {
          if (request.current.active) {
            stop()
            setNotice('This audio could not load. Try another file or format.')
          }
        }}
      />
      {library && (
        <LibraryDialog onClose={() => setLibrary(false)}>
          <section aria-labelledby="music-featured-title">
            <h3 id="music-featured-title">Pratham’s rotation</h3>
            <p>Three little worlds to disappear into.</p>
            {spotifyList(featuredSpotify)}
          </section>
          <section aria-labelledby="music-collection-title">
            <h3 id="music-collection-title">Your collection</h3>
            <p>
              Save Spotify tracks, albums and playlists here. They’ll be waiting
              in this browser next time.
            </p>
            {collection.items.length > 0 && spotifyList(collection.items, true)}
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
                <Plus size={14} /> Add to collection
              </button>
            </form>
          </section>
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
                <h3 id="music-files-title">From your device</h3>
                <p>
                  Drop audio here. Local files play in full and stay on this
                  device for this visit.
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
            {tracks.length > 0 && (
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
            )}
          </section>
          <p className="music-note">
            Spotify loads only when you play a selection. Your saved links stay
            in this browser.{' '}
            <a
              href="https://www.spotify.com/legal/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Spotify privacy
            </a>
          </p>
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
