import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useWebContainer } from '#context/WebContainerContext';
import { getStackFetchOutput } from '#utils/stackfetch';
import 'xterm/css/xterm.css';

import { useWindowStore } from '#store/useWindowStore';

const TerminalBox = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const { instance: webContainer, isLoading, error } = useWebContainer();
  const shellProcessRef = useRef<any>(null);
  const initializedRef = useRef(false); // Tracks if stackfetch has been written
  const [isReady, setIsReady] = useState(false);
  const closeWindow = useWindowStore(state => state.closeWindow);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    // Helper to safely fit the terminal
    const safeFit = () => {
      if (terminalRef.current && terminalRef.current.clientWidth > 0) {
        try {
          fitAddon.fit();
          if (shellProcessRef.current && xtermRef.current) {
            const { cols, rows } = xtermRef.current;
            shellProcessRef.current.resize({ cols, rows });
          }
          // Force a refresh/write if it hasn't been written yet
          if (!initializedRef.current) {
             initializedRef.current = true;
             term.clear();
             term.write(getStackFetchOutput());
          }
        } catch (e) {
          console.warn('Fit error:', e);
        }
      }
    };

    // Fit after a small delay to ensure container has size
    // Use requestAnimationFrame to wait for layout
    requestAnimationFrame(() => {
       setTimeout(safeFit, 100);
    });

    xtermRef.current = term;

    // Handle resizing robustly with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      safeFit();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  useEffect(() => {
    const term = xtermRef.current;
    if (!term || !webContainer || shellProcessRef.current) return;

    const startShell = async () => {
      try {
        const shellProcess = await webContainer.spawn('bash', {
          terminal: {
            cols: term.cols,
            rows: term.rows,
          },
        });

        shellProcessRef.current = shellProcess;
        setIsReady(true);

        // Listen for exit
        shellProcess.exit.then(() => {
          closeWindow('terminal');
        });

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            },
          })
        );

        const input = shellProcess.input.getWriter();

        setTimeout(() => input.write('node -v; python --version; yarn -v; pnpm -v; npm -v\r\n'), 1000);

        term.onData((data) => {
          input.write(data);
        });

        term.onResize((size) => {
          shellProcess.resize({
            cols: size.cols,
            rows: size.rows,
          });
        });

      } catch (error) {
        term.write('\r\n\x1b[31mFailed to start shell.\x1b[0m\r\n');
        console.error('Shell start error:', error);
      }
    };

    startShell();

    return () => {
      if (shellProcessRef.current) {
        shellProcessRef.current.kill();
      }
    };
  }, [webContainer]);

  if (!window.crossOriginIsolated) {
     return (
       <div className="h-full w-full bg-[#1e1e1e] text-red-500 p-4 font-mono">
         Error: SharedArrayBuffer is not available.
         <br />
         Please ensure COOP/COEP headers are set.
       </div>
     );
  }

  if (error) {
    return (
      <div className="h-full w-full bg-[#1e1e1e] text-red-500 p-4 font-mono">
        Error booting WebContainer: {error.message}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#1e1e1e]">
      <div ref={terminalRef} className="h-full w-full" />
      {isLoading && !isReady && (
        <div className="absolute top-2 right-2 text-green-500 font-mono text-xs">
          Initializing...
        </div>
      )}
    </div>
  );
};

export default TerminalBox;
