import { useEffect, useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { locations } from '#constants'
import { useWindowStore } from '#store/useWindowStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PreviewData } from './Preview'

interface FinderItem extends PreviewData {
  id: number | string
  icon: string
  kind?: string
  type?: string
  children?: FinderItem[]
  repoUrl?: string
}

interface FinderWindowData {
  activeSide?: keyof typeof locations
  openFolder?: string
}

const Finder = ({ windowData }: { windowData?: FinderWindowData }) => {
  const [currentFolder, setCurrentFolder] = useState<FinderItem>(locations.work as FinderItem)
  const [history, setHistory] = useState<FinderItem[]>([locations.work as FinderItem])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeSide, setActiveSide] = useState<keyof typeof locations>('work')
  const [selectedId, setSelectedId] = useState<FinderItem['id'] | null>(null)
  const openWindow = useWindowStore((state) => state.openWindow)

  useEffect(() => {
    if (!windowData?.activeSide) return

    const folder = locations[windowData.activeSide] as FinderItem
    const targetFolder = windowData.openFolder
      ? folder.children?.find((item) => item.kind === 'folder' && item.name === windowData.openFolder)
      : undefined

    setCurrentFolder(targetFolder ?? folder)
    setHistory(targetFolder ? [folder, targetFolder] : [folder])
    setCurrentIndex(targetFolder ? 1 : 0)
    setActiveSide(windowData.activeSide)
    setSelectedId(null)
  }, [windowData])

  const navigateTo = (folder: FinderItem) => {
    const nextHistory = history.slice(0, currentIndex + 1)
    nextHistory.push(folder)
    setHistory(nextHistory)
    setCurrentIndex(nextHistory.length - 1)
    setCurrentFolder(folder)
    setSelectedId(null)
  }

  const handleSideClick = (side: keyof typeof locations) => {
    const folder = locations[side] as FinderItem
    setActiveSide(side)
    setHistory([folder])
    setCurrentIndex(0)
    setCurrentFolder(folder)
    setSelectedId(null)
  }

  const goBack = () => {
    if (currentIndex <= 0) return
    const nextIndex = currentIndex - 1
    setCurrentIndex(nextIndex)
    setCurrentFolder(history[nextIndex])
    setSelectedId(null)
  }

  const goForward = () => {
    if (currentIndex >= history.length - 1) return
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)
    setCurrentFolder(history[nextIndex])
    setSelectedId(null)
  }

  const openItem = (item: FinderItem) => {
    if (item.kind === 'folder') {
      navigateTo(item)
      return
    }

    if (item.fileType === 'url' && item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
      return
    }

    if (['pdf', 'img', 'txt'].includes(item.fileType ?? '')) {
      openWindow('preview', item)
      return
    }

    if (item.repoUrl) {
      window.open(item.repoUrl.replace('github.com', 'github1s.com'), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden font-georama border border-white/10 shadow-2xl text-gray-200">
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-[#292929]/90 backdrop-blur-xl border-b border-white/10">
        <WindowControls target="finder" />

        <div className="flex items-center gap-1 ml-2 text-gray-400">
          <button type="button" aria-label="Back" disabled={currentIndex <= 0} className="icon disabled:opacity-30" onClick={goBack}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Forward" disabled={currentIndex >= history.length - 1} className="icon disabled:opacity-30" onClick={goForward}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <span className="font-semibold text-gray-200 ml-1 truncate">{currentFolder.name}</span>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-32 sm:w-48 flex-none bg-white/[0.045] backdrop-blur-2xl border-r border-white/10 p-2 overflow-y-auto text-sm select-none">
          <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1 mt-1">Favorites</p>
          <ul>
            {Object.entries(locations).map(([key, location]) => (
              <li key={key}>
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${activeSide === key ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                  onClick={() => handleSideClick(key as keyof typeof locations)}
                >
                  <img src={location.icon} alt="" className="w-4 h-4" />
                  <span className="truncate">{location.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentFolder.children?.map((child) => (
              <button
                type="button"
                key={child.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 ${selectedId === child.id ? 'bg-blue-500/20 border-blue-400/30' : 'border-transparent hover:bg-white/5 hover:border-white/5'}`}
                onClick={() => {
                  if (window.matchMedia('(pointer: coarse)').matches) {
                    openItem(child)
                  } else {
                    setSelectedId(child.id)
                  }
                }}
                onDoubleClick={() => openItem(child)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') openItem(child)
                }}
                aria-label={`${child.name}. Press Enter or double click to open.`}
              >
                <img src={child.icon} alt="" className="w-12 h-12 object-contain drop-shadow-sm" />
                <span className="text-xs text-center text-gray-300 font-medium break-words line-clamp-2 w-full">
                  {child.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WindowWrapper(Finder, 'finder')
