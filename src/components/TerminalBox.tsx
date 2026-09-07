import { useEffect, useRef, useState } from 'react'
import type { WebContainer, WebContainerProcess } from '@webcontainer/api'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { getStackFetchOutput } from '#utils/stackfetch'
import { useWindowStore } from '#store/useWindowStore'
import 'xterm/css/xterm.css'

let webContainerPromise: Promise<WebContainer> | null = null

const getWebContainer = () => {
  if (!webContainerPromise) {
    webContainerPromise = import('@webcontainer/api')
      .then(({ WebContainer }) => WebContainer.boot())
      .catch((error) => {
        webContainerPromise = null
        throw error
      })
  }

  return webContainerPromise
}

const TerminalBox = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)
  const initializedRef = useRef(false)
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const closeWindow = useWindowStore((state) => state.closeWindow)

  useEffect(() => {
    if (!window.crossOriginIsolated) {
      setError(new Error('SharedArrayBuffer is unavailable. COOP/COEP headers are required for the terminal.'))
      setIsLoading(false)
      return
    }

    let active = true

    getWebContainer()
      .then((instance) => {
        if (active) setWebContainer(instance)
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause : new Error('Failed to boot the terminal environment.'))
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalRef.current)
    xtermRef.current = term

    const safeFit = () => {
      if (!terminalRef.current || terminalRef.current.clientWidth === 0) return

      try {
        fitAddon.fit()
        shellProcessRef.current?.resize({ cols: term.cols, rows: term.rows })

        if (!initializedRef.current) {
          initializedRef.current = true
          term.clear()
          term.write(getStackFetchOutput())
        }
      } catch {
        // The terminal can briefly have zero geometry while its window animates.
      }
    }

    const resizeObserver = new ResizeObserver(safeFit)
    resizeObserver.observe(terminalRef.current)
    requestAnimationFrame(safeFit)

    return () => {
      resizeObserver.disconnect()
      xtermRef.current = null
      term.dispose()
    }
  }, [])

  useEffect(() => {
    const term = xtermRef.current
    if (!term || !webContainer || shellProcessRef.current) return

    let disposed = false
    let input: WritableStreamDefaultWriter<string> | null = null
    let dataSubscription: { dispose: () => void } | null = null
    let resizeSubscription: { dispose: () => void } | null = null

    const startShell = async () => {
      try {
        const shellProcess = await webContainer.spawn('bash', {
          terminal: { cols: term.cols, rows: term.rows },
        })

        if (disposed) {
          shellProcess.kill()
          return
        }

        shellProcessRef.current = shellProcess
        shellProcess.exit.then(() => {
          if (!disposed) closeWindow('terminal')
        })

        void shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data)
            },
          }),
        )

        input = shellProcess.input.getWriter()
        dataSubscription = term.onData((data) => {
          void input?.write(data)
        })
        resizeSubscription = term.onResize(({ cols, rows }) => {
          shellProcess.resize({ cols, rows })
        })
      } catch (cause) {
        term.write('\r\n\x1b[31mFailed to start shell.\x1b[0m\r\n')
        setError(cause instanceof Error ? cause : new Error('Failed to start the shell.'))
      }
    }

    void startShell()

    return () => {
      disposed = true
      dataSubscription?.dispose()
      resizeSubscription?.dispose()
      shellProcessRef.current?.kill()
      shellProcessRef.current = null
      void input?.close()
    }
  }, [webContainer, closeWindow])

  if (error) {
    return (
      <div className="h-full w-full bg-[#1e1e1e] text-red-400 p-4 font-mono text-sm">
        Terminal unavailable: {error.message}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full bg-[#1e1e1e]">
      <div ref={terminalRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute top-2 right-2 text-green-500 font-mono text-xs" role="status">
          Initializing terminal…
        </div>
      )}
    </div>
  )
}

export default TerminalBox
