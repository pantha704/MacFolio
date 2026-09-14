import { dockApps } from '../desktop/appRegistry'
import { useWindowStore } from '#store/useWindowStore'

const Dock = () => {
  const windows = useWindowStore((state) => state.windows)
  const launch = useWindowStore((state) => state.launchFromDock)
  return (
    <section id="dock" aria-label="Application dock">
      <div className="dock-container">
        {dockApps.map(({ id, name, icon, desktopIcon: Icon }) => (
          <div
            key={id}
            className="dock-item relative flex flex-col items-center gap-1"
          >
            <button
              type="button"
              className={`dock-icon${icon ? '' : ` dock-symbol icon-${id}`}`}
              aria-label={name}
              aria-pressed={windows[id].isOpen && !windows[id].isMinimized}
              onClick={() => launch(id)}
            >
              {icon ? (
                <img
                  src={`/images/${icon}`}
                  alt=""
                  width={48}
                  height={48}
                  draggable={false}
                />
              ) : Icon ? (
                <Icon size={28} />
              ) : null}
            </button>
            <span className="dock-label" aria-hidden="true">
              {name}
            </span>
            <span
              aria-hidden="true"
              className={`size-1 rounded-full bg-white/80 ${windows[id].isOpen ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
export default Dock
