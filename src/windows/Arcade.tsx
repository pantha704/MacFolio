import { useCallback, useEffect, useRef, useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { useWindowStore } from '#store/useWindowStore'
import { safeStorage } from '../utils/storage'

type Game = 'pinball' | 'pong' | 'racer'
type GamePhase = 'ready' | 'playing' | 'paused' | 'gameover'
const gameNames: Record<Game, string> = { pinball: 'Pocket Pinball', pong: 'Paddle Club', racer: 'Midnight Ride' }

const Arcade = () => {
  const [game, setGame] = useState<Game>('pinball')
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Math.max(0, Number(safeStorage.getItem('arcade-pinball')) || 0))
  const [lives, setLives] = useState(3)
  const canvas = useRef<HTMLCanvasElement>(null)
  const keys = useRef(new Set<string>())
  const phaseRef = useRef<GamePhase>('ready')
  const frameRef = useRef(0)
  const drawRef = useRef<((stamp: number) => void) | null>(null)
  const resetRef = useRef<(() => void) | null>(null)
  const active = useWindowStore(state => state.focusedWindow === 'arcade' && !state.windows.arcade.isMinimized)
  const transition = useCallback((next: GamePhase) => {
    phaseRef.current = next
    setPhase(next)
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(stamp => drawRef.current?.(stamp))
  }, [])

  useEffect(() => {
    if (active || phaseRef.current !== 'playing') return
    let cancelled = false
    queueMicrotask(() => { if (!cancelled && phaseRef.current === 'playing') transition('paused') })
    return () => { cancelled = true }
  }, [active, transition])
  useEffect(() => {
    const pause = () => { keys.current.clear(); if (phaseRef.current === 'playing') transition('paused') }
    const visibility = () => { if (document.hidden) pause() }
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', visibility) }
  }, [transition])

  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    const ctx = context
    let x = 240, y = game === 'racer' ? 410 : 260, vx = 155, vy = -220
    let player = 240, enemy = 240, elapsed = 0, points = 0, remaining = 3, last = 0
    let obstacleX = 150, obstacleY = -90, secondX = 330, secondY = -300, invulnerable = 0, lastSurvivalPoint = 0
    const rect = (x: number, y: number, width: number, height: number, colour: string) => { ctx.fillStyle = colour; ctx.fillRect(x, y, width, height) }
    const circle = (x: number, y: number, radius: number, colour: string) => { ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill() }
    const save = () => setBest(current => { const next = Math.max(current, points); safeStorage.setItem(`arcade-${game}`, String(next)); return next })
    const add = (value: number) => { points += value; setScore(points); save() }
    const loseLife = () => {
      remaining -= 1
      setLives(remaining)
      if (remaining <= 0) { save(); transition('gameover'); return true }
      return false
    }
    const reset = () => {
      x = 240; y = game === 'racer' ? 410 : 260; vx = 155; vy = -220; player = 240; enemy = 240; elapsed = 0; points = 0; remaining = 3; last = 0
      obstacleX = 150; obstacleY = -90; secondX = 330; secondY = -300; invulnerable = 0; lastSurvivalPoint = 0
      keys.current.clear(); setScore(0); setLives(3)
    }
    resetRef.current = reset

    const drawBike = (cx: number, cy: number, colour: string) => {
      circle(cx - 10, cy + 23, 8, '#111827'); circle(cx + 10, cy + 23, 8, '#111827')
      rect(cx - 12, cy - 12, 24, 35, colour); rect(cx - 17, cy - 6, 34, 5, '#d8e5ff'); circle(cx, cy - 17, 8, '#f5d0a9')
    }
    const draw = (stamp: number) => {
      const playing = phaseRef.current === 'playing'
      const dt = last ? Math.min((stamp - last) / 1000, 0.04) : 0
      last = stamp
      if (playing) elapsed += dt
      rect(0, 0, 480, 480, '#080d19')
      const left = keys.current.has('ArrowLeft') || keys.current.has('a')
      const right = keys.current.has('ArrowRight') || keys.current.has('d')
      if (playing) player = Math.max(game === 'racer' ? 108 : 55, Math.min(game === 'racer' ? 372 : 425, player + (Number(right) - Number(left)) * 340 * dt))

      if (game === 'pong') {
        for (let i = 18; i < 480; i += 25) rect(238, i, 3, 11, '#26344c')
        if (playing) {
          x += vx * dt; y += vy * dt; enemy += Math.sign(x - enemy) * Math.min(Math.abs(x - enemy), 155 * dt)
          if (x < 20 || x > 460) { vx *= -1; x = Math.max(20, Math.min(460, x)) }
          if (vy > 0 && y >= 426 && y < 451 && Math.abs(x - player) < 59) { vy = -Math.abs(vy) * 1.035; vx = (x - player) * 5; add(10) }
          if (vy < 0 && y <= 54 && y > 26 && Math.abs(x - enemy) < 59) vy = Math.abs(vy)
          if (y < 5) { add(50); x = 240; y = 240; vy = 220 }
          if (y > 490 && !loseLife()) { x = 240; y = 280; vy = -220 }
        }
        rect(player - 50, 438, 100, 9, '#7cf4cb'); rect(enemy - 50, 34, 100, 9, '#ff88bb'); circle(x, y, 8, '#fff')
      } else if (game === 'pinball') {
        if (playing) {
          vy += 305 * dt; x += vx * dt; y += vy * dt
          if (x < 24 || x > 456) { vx *= -1; x = Math.max(24, Math.min(456, x)) }
          if (y < 25) { vy = Math.abs(vy); y = 25 }
        }
        ctx.strokeStyle = '#283858'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(17, 17, 446, 446, 26); ctx.stroke()
        for (const [bx, by] of [[150, 140], [330, 140], [240, 235]] as const) {
          circle(bx, by, 31, '#573e78'); circle(bx, by, 22, '#ff8fd1')
          const dx = x - bx, dy = y - by, distance = Math.hypot(dx, dy)
          if (playing && distance < 40 && distance > 0) { x = bx + dx / distance * 41; y = by + dy / distance * 41; vx = dx / distance * 315; vy = dy / distance * 315; add(25) }
        }
        const flipper = (cx: number, held: boolean, direction: number) => {
          ctx.strokeStyle = held ? '#fff3a8' : '#70e9c0'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, 432); ctx.lineTo(cx + direction * 82, held ? 405 : 453); ctx.stroke()
          if (playing && held && vy > 0 && y > 392 && y < 459 && x > Math.min(cx, cx + direction * 82) - 10 && x < Math.max(cx, cx + direction * 82) + 10) { vy = -445; vx = direction * 135; y = 390; add(5) }
        }
        flipper(125, left, 1); flipper(355, right, -1); circle(x, y, 8, '#fff')
        if (playing && y > 495 && !loseLife()) { x = 240; y = 300; vx = remaining % 2 ? 160 : -160; vy = -300 }
      } else {
        const horizon = 105
        ctx.fillStyle = '#10152b'; ctx.fillRect(0, 0, 480, horizon)
        ctx.fillStyle = '#f1789f'; ctx.beginPath(); ctx.arc(240, 92, 39, Math.PI, 0); ctx.fill()
        ctx.fillStyle = '#111a2d'; ctx.beginPath(); ctx.moveTo(55, 480); ctx.lineTo(184, horizon); ctx.lineTo(296, horizon); ctx.lineTo(425, 480); ctx.fill()
        for (let i = 0; i < 7; i++) { const laneY = ((i * 90 + elapsed * 245) % 630) - 30; const scale = Math.max(.15, laneY / 480); rect(238 - scale * 2, laneY, 4 * scale, 36 * scale, '#f7d89a') }
        if (playing) {
          invulnerable = Math.max(0, invulnerable - dt)
          const survivalPoints = Math.floor(elapsed)
          if (survivalPoints > lastSurvivalPoint) {
            add(survivalPoints - lastSurvivalPoint)
            lastSurvivalPoint = survivalPoints
          }
          const speed = 195 + Math.min(150, points * 2)
          obstacleY += speed * dt; secondY += speed * .92 * dt
          if (obstacleY > 530) { obstacleY = -90; obstacleX = 112 + Math.random() * 256; add(10) }
          if (secondY > 530) { secondY = -180; secondX = 112 + Math.random() * 256; add(10) }
          for (const [ox, oy] of [[obstacleX, obstacleY], [secondX, secondY]]) if (!invulnerable && Math.abs(player - ox) < 31 && Math.abs(410 - oy) < 52) { invulnerable = 1.5; if (loseLife()) break }
        }
        drawBike(obstacleX, obstacleY, '#fd7aa7'); drawBike(secondX, secondY, '#75a9ff')
        if (!invulnerable || Math.floor(invulnerable * 8) % 2 === 0) drawBike(player, 410, '#73efc0')
      }

      if (phaseRef.current !== 'playing') {
        ctx.fillStyle = '#050914bb'; ctx.fillRect(0, 0, 480, 480)
        ctx.fillStyle = '#fff'; ctx.font = '600 26px system-ui'; ctx.textAlign = 'center'
        ctx.fillText(phaseRef.current === 'paused' ? 'Paused' : phaseRef.current === 'gameover' ? 'Game over' : gameNames[game], 240, 225)
        ctx.fillStyle = '#b8c5db'; ctx.font = '15px system-ui'; ctx.fillText(phaseRef.current === 'paused' ? 'Resume when you’re ready' : phaseRef.current === 'gameover' ? `Final score ${points}` : 'Press Play to begin', 240, 258)
      }
      if (phaseRef.current === 'playing') frameRef.current = requestAnimationFrame(draw)
    }
    drawRef.current = draw
    frameRef.current = requestAnimationFrame(draw)
    const heldKeys = keys.current
    return () => { cancelAnimationFrame(frameRef.current); drawRef.current = null; resetRef.current = null; heldKeys.clear() }
  }, [game, transition])

  const setKey = (key: string, down: boolean) => { if (down) keys.current.add(key); else keys.current.delete(key) }
  const chooseGame = (next: Game) => {
    if (next === game) return
    transition('ready')
    setScore(0)
    setLives(3)
    setBest(Math.max(0, Number(safeStorage.getItem(`arcade-${next}`)) || 0))
    setGame(next)
  }
  const playPause = () => {
    if (phaseRef.current === 'playing') transition('paused')
    else if (phaseRef.current === 'paused') transition('playing')
    else { resetRef.current?.(); transition('playing') }
  }
  return <div className="arcade-app"><header className="window-header"><WindowControls target="arcade"/><span>After Hours Arcade</span></header><div className="arcade-toolbar">{(Object.keys(gameNames) as Game[]).map(item => <button key={item} aria-pressed={game === item} onClick={() => chooseGame(item)}>{gameNames[item]}</button>)}<span>Score {score} · Best {best} · Lives {lives}</span></div><div className="arcade-stage" tabIndex={0} aria-label={`${gameNames[game]} controls: left and right arrows, A and D`} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(event.key)) { event.preventDefault(); setKey(event.key, true) } }} onKeyUp={event => setKey(event.key, false)} onBlur={() => { keys.current.clear(); if (phaseRef.current === 'playing') transition('paused') }}><canvas ref={canvas} width={480} height={480} aria-label={`${gameNames[game]} game field`}/></div><div className="arcade-controls"><button onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setKey('ArrowLeft', true) }} onPointerUp={() => setKey('ArrowLeft', false)} onPointerCancel={() => setKey('ArrowLeft', false)} onLostPointerCapture={() => setKey('ArrowLeft', false)}>◀ Left</button><button className="arcade-play" onClick={event => { playPause(); (event.currentTarget.closest('.arcade-app')?.querySelector('.arcade-stage') as HTMLElement)?.focus() }}>{phase === 'playing' ? 'Pause' : phase === 'paused' ? 'Resume' : phase === 'gameover' ? 'Play again' : 'Play'}</button><button onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setKey('ArrowRight', true) }} onPointerUp={() => setKey('ArrowRight', false)} onPointerCancel={() => setKey('ArrowRight', false)} onLostPointerCapture={() => setKey('ArrowRight', false)}>Right ▶</button></div><p className="arcade-caption">{game === 'pinball' ? 'Hold left and right independently to lift the flippers.' : game === 'pong' ? 'Return the ball and protect the bottom edge.' : 'Steer through neon traffic. The road gets faster as you score.'} Switching apps pauses your run.</p></div>
}
export default WindowWrapper(Arcade, 'arcade')
