import { useEffect, useRef, useState } from 'react'
import {
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Zap,
} from 'lucide-react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { useWindowStore } from '#store/useWindowStore'
import { safeStorage } from '../utils/storage'
import {
  createGame,
  emptyInput,
  fixedStepper,
  games,
  stepGame,
  type GameId,
  type Input,
} from '../arcade/engine'
import '../arcade/arcade.css'
function GameSession({ game }: { game: GameId }) {
  const state = useRef(createGame(game)),
    input = useRef(emptyInput()),
    host = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null)
  const best = useRef(
    Math.max(0, Number(safeStorage.getItem(`arcade-${game}`)) || 0),
  )
  const [hud, setHud] = useState({
    phase: state.current.phase,
    score: 0,
    lives: 3,
    best: best.current,
    energy: 100,
    speed: 0,
  })
  const [loaded, setLoaded] = useState(false),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0)
  const publish = () => {
    const s = state.current
    best.current = Math.max(best.current, s.score)
    setHud({
      phase: s.phase,
      score: s.score,
      lives: s.lives,
      best: best.current,
      energy: Math.round(s.energy),
      speed: Math.round(s.speed * 3.6),
    })
  }
  const save = () =>
    safeStorage.setItem(
      `arcade-${game}`,
      String(Math.max(best.current, state.current.score)),
    )
  useEffect(() => {
    let disposed = false,
      frame = 0,
      last = 0,
      lastHud = 0
    let view:
      | {
          draw: (s: ReturnType<typeof createGame>) => void
          dispose: () => void
        }
      | undefined
    const stepper = fixedStepper()
    const showHud = () => {
      const s = state.current
      best.current = Math.max(best.current, s.score)
      setHud({
        phase: s.phase,
        score: s.score,
        lives: s.lives,
        best: best.current,
        energy: Math.round(s.energy),
        speed: Math.round(s.speed * 3.6),
      })
    }
    const saveBest = () =>
      safeStorage.setItem(
        `arcade-${game}`,
        String(Math.max(best.current, state.current.score)),
      )
    const pause = () => {
      input.current = emptyInput()
      if (state.current.phase === 'playing') {
        state.current.phase = 'paused'
        showHud()
        saveBest()
      }
      stepper.reset()
      last = 0
    }
    const active = () => {
      const store = useWindowStore.getState()
      return (
        store.focusedWindow === 'arcade' &&
        store.windows.arcade.isOpen &&
        !store.windows.arcade.isMinimized &&
        !document.hidden
      )
    }
    const visibility = () => {
      if (document.hidden) pause()
    }
    const unsubscribe = useWindowStore.subscribe(() => {
      if (!active()) pause()
    })
    const fail = () => {
      if (disposed) return
      pause()
      setError(true)
      setLoaded(false)
    }
    const draw = (stamp: number) => {
      if (disposed) return
      if (active()) {
        if (last)
          stepper.advance((stamp - last) / 1000, (dt) =>
            stepGame(state.current, input.current, dt),
          )
        last = stamp
        view?.draw(state.current)
        if (stamp - lastHud >= 100) {
          showHud()
          lastHud = stamp
          if (state.current.phase === 'over') saveBest()
        }
      } else {
        last = 0
      }
      frame = requestAnimationFrame(draw)
    }
    void import('../arcade/renderer')
      .then(({ createArcadeRenderer }) => {
        if (disposed || !host.current) return
        view = createArcadeRenderer(host.current, game, fail)
        setLoaded(true)
        frame = requestAnimationFrame(draw)
      })
      .catch(fail)
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      unsubscribe()
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', visibility)
      saveBest()
      view?.dispose()
    }
  }, [game, attempt])
  const start = () => {
    if (!loaded || error) return
    if (state.current.phase === 'over' || state.current.phase === 'ready')
      state.current = createGame(game)
    state.current.phase = 'playing'
    publish()
    stage.current?.focus({ preventScroll: true })
  }
  const pause = () => {
    state.current.phase = 'paused'
    input.current = emptyInput()
    publish()
    save()
  }
  const restart = () => {
    save()
    state.current = createGame(game)
    input.current = emptyInput()
    publish()
  }
  const keys: Record<string, keyof Input> = {
    ArrowLeft: 'left',
    a: 'left',
    ArrowRight: 'right',
    d: 'right',
    Shift: 'boost',
    ArrowDown: 'brake',
    s: 'brake',
  }
  const held = (key: keyof Input) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      input.current[key] = true
    },
    onPointerUp: () => {
      input.current[key] = false
    },
    onPointerCancel: () => {
      input.current[key] = false
    },
    onLostPointerCapture: () => {
      input.current[key] = false
    },
  })
  return (
    <div className="game-session">
      <div className="game-hud">
        <div className="score-block" aria-label="Score">
          <span>{game === 'racer' ? 'DISTANCE' : 'SCORE'}</span>
          <strong>
            {String(hud.score).padStart(4, '0')}
            {game === 'racer' && <small> m</small>}
          </strong>
        </div>
        <div className="game-record">
          <span>PERSONAL BEST</span>
          <strong>{hud.best.toLocaleString()}</strong>
        </div>
        <div className="game-lives" aria-label={`${hud.lives} lives remaining`}>
          {[0, 1, 2].map((i) => (
            <i key={i} className={i < hud.lives ? 'alive' : ''} />
          ))}
        </div>
        <div className="game-tools">
          {hud.phase === 'playing' ? (
            <button onClick={pause} aria-label="Pause game">
              <Pause size={17} />
            </button>
          ) : hud.phase === 'paused' ? (
            <button onClick={start} aria-label="Resume game">
              <Play size={17} />
            </button>
          ) : null}
          <button onClick={restart} aria-label="Restart game">
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div
        className="game-stage"
        tabIndex={0}
        ref={stage}
        aria-label={`${games[game].name} keyboard controls`}
        onKeyDown={(e) => {
          if (keys[e.key]) {
            e.preventDefault()
            input.current[keys[e.key]] = true
          }
          if (e.code === 'Space' && !e.repeat) {
            e.preventDefault()
            if (state.current.phase === 'playing') pause()
            else start()
          }
        }}
        onKeyUp={(e) => {
          if (keys[e.key]) {
            e.preventDefault()
            input.current[keys[e.key]] = false
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node))
            input.current = emptyInput()
        }}
      >
        <div className="game-canvas" ref={host} />
        {(hud.phase !== 'playing' || error) && (
          <div className="game-overlay">
            <span className="game-eyebrow">
              {error
                ? 'GRAPHICS UNAVAILABLE'
                : hud.phase === 'paused'
                  ? 'TAKE YOUR TIME'
                  : hud.phase === 'over'
                    ? 'ONE MORE TRY?'
                    : 'AFTER HOURS / 0' +
                      (['pinball', 'pong', 'racer'].indexOf(game) + 1)}
            </span>
            <h2>
              {error
                ? 'A small detour.'
                : hud.phase === 'paused'
                  ? 'Paused.'
                  : hud.phase === 'over'
                    ? 'Good run.'
                    : games[game].tag}
            </h2>
            <p>
              {error
                ? 'This browser could not start the 3D scene. Try again, or enable hardware acceleration.'
                : hud.phase === 'over'
                  ? `You scored ${hud.score}. Your best is ${hud.best}.`
                  : games[game].description}
            </p>
            <button
              className="game-start"
              disabled={!error && !loaded}
              onClick={() => {
                if (error) {
                  setError(false)
                  setAttempt((a) => a + 1)
                } else start()
              }}
            >
              <Play size={16} />
              {error
                ? 'Retry graphics'
                : !loaded
                  ? 'Preparing the scene…'
                  : hud.phase === 'paused'
                    ? 'Resume playing'
                    : hud.phase === 'over'
                      ? 'Play again'
                      : 'Start playing'}
            </button>
          </div>
        )}
        {game === 'racer' && hud.phase === 'playing' && (
          <div className="game-telemetry">
            <strong>
              {hud.speed}
              <small> km/h</small>
            </strong>
            <label>
              <Zap size={13} />
              <meter
                min={0}
                max={100}
                value={hud.energy}
                aria-label="Boost energy"
              />
            </label>
          </div>
        )}
      </div>
      <div className="game-footer">
        <p>
          {games[game].controls}
          <span>Space pauses · Switching apps pauses your run</span>
        </p>
        <div className="game-touch">
          <button {...held('left')} aria-label="Hold left">
            <ArrowLeft size={19} />
          </button>
          {game === 'racer' && (
            <>
              <button {...held('brake')}>Brake</button>
              <button {...held('boost')} aria-label="Hold boost">
                <Zap size={17} />
              </button>
            </>
          )}
          <button {...held('right')} aria-label="Hold right">
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </div>
  )
}
function Arcade() {
  const [game, setGame] = useState<GameId>('pinball')
  return (
    <div className="arcade-app">
      <header className="window-header">
        <WindowControls target="arcade" />
        <span>After Hours</span>
        <span className="arcade-header-note">
          A LITTLE PLAY GOES A LONG WAY
        </span>
      </header>
      <div
        className="arcade-selector"
        role="tablist"
        aria-label="Choose a game"
      >
        {(Object.keys(games) as GameId[]).map((id, i) => (
          <button
            role="tab"
            aria-selected={game === id}
            key={id}
            onClick={() => setGame(id)}
          >
            <small>0{i + 1}</small>
            <strong>{games[id].name}</strong>
            <span>
              {id === 'pinball'
                ? 'THE CLASSIC'
                : id === 'pong'
                  ? 'THE RALLY'
                  : 'THE ESCAPE'}
            </span>
          </button>
        ))}
      </div>
      <GameSession key={game} game={game} />
    </div>
  )
}
export default WindowWrapper(Arcade, 'arcade')
