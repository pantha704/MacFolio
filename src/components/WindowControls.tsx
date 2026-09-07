import { useWindowStore, type WindowKey } from '#store/useWindowStore'

const WindowControls = ({ target }: { target: WindowKey }) => {
  const closeWindow = useWindowStore((state) => state.closeWindow)
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow)
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow)
  const isMaximized = useWindowStore((state) => state.windows[target].isMaximized)

  return (
    <div id="window-controls" className="group/controls" role="group" aria-label="Window controls">
      <button
        type="button"
        className="close flex items-center justify-center"
        onClick={(event) => {
          event.stopPropagation()
          closeWindow(target)
        }}
        aria-label="Close window"
        title="Close (Alt+W)"
      >
        <svg aria-hidden="true" className="w-2 h-2 text-black/55 opacity-0 group-hover/controls:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <button
        type="button"
        className="minimize flex items-center justify-center"
        onClick={(event) => {
          event.stopPropagation()
          minimizeWindow(target)
        }}
        aria-label="Minimize window"
        title="Minimize"
      >
        <svg aria-hidden="true" className="w-2 h-2 text-black/55 opacity-0 group-hover/controls:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      </button>

      <button
        type="button"
        className="maximize flex items-center justify-center"
        onClick={(event) => {
          event.stopPropagation()
          maximizeWindow(target)
        }}
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        <svg aria-hidden="true" className="w-1.5 h-1.5 text-black/55 opacity-0 group-hover/controls:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          {isMaximized ? (
            <>
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </>
          ) : (
            <>
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}

export default WindowControls
