import { useWindowStore } from '#store/useWindowStore'

const WindowControls = ({target}: {target: any}) => {
  const { closeWindow, minimizeWindow, maximizeWindow, windows } = useWindowStore()
  const isMaximized = windows[target as keyof typeof windows]?.isMaximized

  return (
    <div id="window-controls" className="group/controls">
      <div
        className='close flex items-center justify-center group-hover/controls:bg-[#ff6157] transition-colors'
        onClick={(e) => { e.stopPropagation(); closeWindow(target); }}
        title="Close (Alt+W)"
      >
        <svg className="w-2 h-2 text-black/50 opacity-0 group-hover/controls:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </div>
      <div
        className='minimize flex items-center justify-center group-hover/controls:bg-[#ffc030] transition-colors'
        onClick={(e) => { e.stopPropagation(); minimizeWindow(target); }}
        title="Minimize"
      >
        <svg className="w-2 h-2 text-black/50 opacity-0 group-hover/controls:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
        </svg>
      </div>
      <div
        className='maximize flex items-center justify-center group-hover/controls:bg-[#2acb42] transition-colors'
        onClick={(e) => { e.stopPropagation(); maximizeWindow(target); }}
        title={isMaximized ? "Exit Full Screen" : "Enter Full Screen"}
      >
        <svg className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover/controls:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {isMaximized ? (
                <><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></>
            ) : (
                <><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></>
            )}
        </svg>
      </div>
    </div>
  )
}

export default WindowControls
