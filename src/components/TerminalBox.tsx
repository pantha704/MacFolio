import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useWebContainer } from '#context/WebContainerContext'
import { getStackFetchOutput } from '#utils/stackfetch'
import { useWindowStore } from '#store/useWindowStore'
import type { WebContainerProcess } from '@webcontainer/api'
import { profile } from '../data/portfolio'
import 'xterm/css/xterm.css'

const Shell = () => {
  const host = useRef<HTMLDivElement>(null)
  const { instance } = useWebContainer()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!host.current || !instance) return
    let disposed = false
    let process: WebContainerProcess | undefined
    let writer: WritableStreamDefaultWriter<string> | undefined
    let inputSubscription: { dispose(): void } | undefined
    const outputAbort = new AbortController()
    const term = new Terminal({ cursorBlink: true, fontFamily: 'Menlo, Monaco, monospace', fontSize: 14, convertEol: true, theme: { background: '#1e1e1e', foreground: '#e4ecff' } })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(host.current)
    const fitToHost = () => { if (host.current?.clientWidth && host.current?.clientHeight) { fit.fit(); process?.resize({ cols: term.cols, rows: term.rows }) } }
    const observer = new ResizeObserver(fitToHost)
    observer.observe(host.current)
    const frame = requestAnimationFrame(fitToHost)
    term.write(getStackFetchOutput())
    void (async () => {
      try {
        const shell = await instance.spawn('jsh', { terminal: { cols: term.cols, rows: term.rows } })
        if (disposed) { shell.kill(); return }
        process = shell
        writer = shell.input.getWriter()
        inputSubscription = term.onData(data => { void writer?.write(data).catch(() => { if (!disposed) setFailed(true) }) })
        void shell.output.pipeTo(new WritableStream({ write(data) { if (!disposed) term.write(data) } }), { signal: outputAbort.signal }).catch(() => { if (!disposed) setFailed(true) })
        void shell.exit.then(() => { if (!disposed) useWindowStore.getState().closeWindow('terminal') })
      } catch { if (!disposed) setFailed(true) }
    })()
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); inputSubscription?.dispose(); outputAbort.abort(); process?.kill(); writer?.releaseLock(); term.dispose() }
  }, [instance])
  return <div className="relative h-full"><div ref={host} className="h-full w-full" />{failed && <div className="terminal-fallback absolute inset-0 bg-[#1e1e1e]" role="alert"><h2>The shell stopped responding.</h2><p>Close Terminal and reopen it to try again.</p><a href={profile.github} target="_blank" rel="noopener noreferrer">Explore my code on GitHub</a></div>}</div>
}
const TerminalBox = () => {
  const { instance, isLoading, error } = useWebContainer()
  if (error) return <div className="terminal-fallback"><h2>The interactive shell isn’t available here.</h2><p>You can still explore all my projects and source code.</p><a className="secondary-action" href={profile.github} target="_blank" rel="noopener noreferrer">Explore GitHub</a></div>
  if (isLoading || !instance) return <div className="terminal-fallback" role="status">Starting your shell…</div>
  return <Shell />
}
export default TerminalBox
