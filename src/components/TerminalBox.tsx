import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import type { WebContainerProcess } from '@webcontainer/api'
import { useWebContainer } from '#context/WebContainerContext'
import { getStackFetchOutput } from '#utils/stackfetch'
import { useWindowStore } from '#store/useWindowStore'
import { profile } from '../data/portfolio'
import 'xterm/css/xterm.css'

type SessionState = {
  phase: 'starting' | 'running' | 'exited' | 'failed'
  message?: string
}

const Shell = () => {
  const host = useRef<HTMLDivElement>(null)
  const { instance } = useWebContainer()
  const [session, setSession] = useState<SessionState>({ phase: 'starting' })
  const [restart, setRestart] = useState(0)

  useEffect(() => {
    if (!host.current || !instance) return
    let disposed = false
    let process: WebContainerProcess | undefined
    let writer: WritableStreamDefaultWriter<string> | undefined
    let inputSubscription: { dispose(): void } | undefined
    let writeQueue = Promise.resolve()
    const outputAbort = new AbortController()
    const term = new Terminal({
      cursorBlink: true,
      allowProposedApi: false,
      scrollback: 3000,
      fontFamily: 'Menlo, Monaco, ui-monospace, monospace',
      fontSize: 14,
      lineHeight: 1.25,
      convertEol: true,
      theme: {
        background: '#10151b',
        foreground: '#d8eee1',
        cursor: '#a8ffd5',
        selectionBackground: '#5a82b866',
      },
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(host.current)
    const fitToHost = () => {
      if (!host.current?.clientWidth || !host.current.clientHeight) return
      try {
        fit.fit()
        process?.resize({ cols: term.cols, rows: term.rows })
      } catch {
        /* A hidden terminal can briefly have no measurable cells. */
      }
    }
    const observer = new ResizeObserver(fitToHost)
    observer.observe(host.current)
    const frame = requestAnimationFrame(fitToHost)
    let focusFrame = 0
    const unsubscribe = useWindowStore.subscribe((current, previous) => {
      if (
        current.focusedWindow === 'terminal' &&
        previous.focusedWindow !== 'terminal'
      ) {
        cancelAnimationFrame(focusFrame)
        focusFrame = requestAnimationFrame(() => {
          if (!disposed) {
            fitToHost()
            term.focus()
          }
        })
      }
    })
    term.write(getStackFetchOutput())
    const startupTimer = window.setTimeout(() => {
      if (!disposed)
        setSession({
          phase: 'failed',
          message:
            'The shell process is still not responding. You can restart this shell without reloading the desktop.',
        })
    }, 60_000)

    void (async () => {
      try {
        const shell = await instance.spawn('jsh', {
          terminal: { cols: term.cols, rows: term.rows },
        })
        clearTimeout(startupTimer)
        if (disposed) {
          shell.kill()
          return
        }
        process = shell
        writer = shell.input.getWriter()
        fitToHost()
        setSession({ phase: 'running' })
        if (useWindowStore.getState().focusedWindow === 'terminal') term.focus()
        inputSubscription = term.onData((data) => {
          writeQueue = writeQueue
            .then(() => writer?.write(data))
            .catch(() => {
              if (!disposed)
                setSession({
                  phase: 'failed',
                  message:
                    'Terminal input stopped. Restart the shell to reconnect.',
                })
            }) as Promise<void>
        })
        void shell.output
          .pipeTo(
            new WritableStream({
              write(data) {
                if (!disposed) term.write(data)
              },
            }),
            { signal: outputAbort.signal },
          )
          .catch((error) => {
            if (!disposed && (error as Error)?.name !== 'AbortError')
              setSession({
                phase: 'failed',
                message:
                  'Terminal output disconnected. Restart the shell to reconnect.',
              })
          })
        void shell.exit
          .then((code) => {
            if (!disposed) {
              term.write(
                `\r\n\x1b[90mProcess exited with code ${code}.\x1b[0m\r\n`,
              )
              setSession({
                phase: 'exited',
                message: `Shell exited with code ${code}.`,
              })
            }
          })
          .catch(() => {
            if (!disposed)
              setSession({
                phase: 'failed',
                message:
                  'The shell connection ended unexpectedly. Restart to reconnect.',
              })
          })
      } catch (error) {
        clearTimeout(startupTimer)
        if (!disposed)
          setSession({
            phase: 'failed',
            message:
              error instanceof Error
                ? error.message
                : 'The shell could not start.',
          })
      }
    })()

    return () => {
      clearTimeout(startupTimer)
      disposed = true
      cancelAnimationFrame(frame)
      cancelAnimationFrame(focusFrame)
      unsubscribe()
      observer.disconnect()
      inputSubscription?.dispose()
      outputAbort.abort()
      process?.kill()
      writer?.releaseLock()
      term.dispose()
    }
  }, [instance, restart])

  const restartShell = () => {
    setSession({ phase: 'starting' })
    setRestart((value) => value + 1)
  }

  return (
    <div className="terminal-session">
      <div ref={host} className="terminal-host" />
      {session.phase !== 'running' && (
        <div
          className={`terminal-session-status is-${session.phase}`}
          role={session.phase === 'failed' ? 'alert' : 'status'}
        >
          <span>
            {session.phase === 'starting' ? 'Starting shell…' : session.message}
          </span>
          {session.phase !== 'starting' && (
            <button onClick={restartShell}>Restart shell</button>
          )}
        </div>
      )}
    </div>
  )
}

const TerminalBox = () => {
  const { instance, phase, error, elapsed, retry } = useWebContainer()
  if (instance) return <Shell />
  if (phase === 'failed' || phase === 'unsupported')
    return (
      <div className="terminal-fallback">
        <h2>
          {phase === 'unsupported'
            ? 'This browser session cannot start the Node runtime.'
            : 'The Node runtime could not start.'}
        </h2>
        <p role="alert">{error?.message}</p>
        <p>
          Your other portfolio apps still work. Terminal requires HTTPS,
          cross-origin isolation, and a compatible browser.
        </p>
        <div className="terminal-actions">
          <button className="secondary-action" onClick={retry}>
            Try again
          </button>
          <button
            className="secondary-action"
            onClick={() => window.location.reload()}
          >
            Reload desktop
          </button>
          <a
            className="secondary-action"
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore GitHub
          </a>
        </div>
      </div>
    )
  return (
    <div className="terminal-fallback" role="status">
      <h2>
        {phase === 'still-starting'
          ? 'The runtime is taking longer than usual.'
          : 'Preparing the Node runtime…'}
      </h2>
      <p>
        {elapsed ? `${elapsed} seconds elapsed. ` : ''}This work continues while
        the Terminal remains open.
      </p>
      {phase === 'still-starting' && (
        <button className="secondary-action" onClick={retry}>
          Check again
        </button>
      )}
    </div>
  )
}
export default TerminalBox
