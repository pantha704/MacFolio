import { useState, useEffect } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { locations } from '#constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FinderItem {
    id: number | string;
    name: string;
    icon: string;
    kind?: string;
    type?: string;
    children?: FinderItem[];
    repoUrl?: string;
    fileType?: string;
    href?: string;
    [key: string]: any;
}

const Finder = ({ windowData }: { windowData?: { activeSide?: keyof typeof locations } }) => {
  const [currentFolder, setCurrentFolder] = useState<FinderItem>(locations.work as FinderItem)
  const [history, setHistory] = useState<FinderItem[]>([locations.work as FinderItem])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeSide, setActiveSide] = useState<keyof typeof locations>('work')

  useEffect(() => {
    if (windowData?.activeSide) {
        const folder = locations[windowData.activeSide] as FinderItem
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setCurrentFolder(folder)
        setHistory([folder])
        setCurrentIndex(0)
        setActiveSide(windowData.activeSide)
    }
  }, [windowData])

  const navigateTo = (folder: FinderItem) => {
    const newHistory = history.slice(0, currentIndex + 1)
    newHistory.push(folder)
    setHistory(newHistory)
    setCurrentIndex(newHistory.length - 1)
    setCurrentFolder(folder)
  }

  const handleSideClick = (side: keyof typeof locations) => {
    const folder = locations[side] as FinderItem
    setActiveSide(side)
    // Reset history when switching sidebar items
    setHistory([folder])
    setCurrentIndex(0)
    setCurrentFolder(folder)
  }

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setCurrentFolder(history[newIndex])
    }
  }

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setCurrentFolder(history[newIndex])
    }
  }

  const handleItemClick = (child: FinderItem) => {
    if (child.kind === 'folder') {
        navigateTo(child)
    } else if (child.fileType === 'url' && child.href) {
        window.open(child.href, '_blank')
    } else if (child.repoUrl) {
         // Fallback for old structure if any
        const github1sUrl = child.repoUrl.replace('github.com', 'github1s.com')
        window.open(github1sUrl, '_blank')
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden font-georama border border-gray-800 shadow-2xl text-gray-200">
      {/* Header */}
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-[#2a2a2a] border-b border-gray-800">
        <WindowControls target="finder" />

        <div className="flex items-center gap-2 ml-4 text-gray-400">
          <ChevronLeft
            className={`icon w-5 h-5 transition-colors ${currentIndex > 0 ? 'cursor-pointer hover:text-white text-gray-400' : 'text-gray-600 cursor-default'}`}
            onClick={goBack}
          />
          <ChevronRight
            className={`icon w-5 h-5 transition-colors ${currentIndex < history.length - 1 ? 'cursor-pointer hover:text-white text-gray-400' : 'text-gray-600 cursor-default'}`}
            onClick={goForward}
          />
        </div>

        <span className="font-semibold text-gray-200 ml-2">
            {currentFolder.name}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-gray-400">
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#252525]/80 backdrop-blur-xl border-r border-gray-800 p-2 overflow-y-auto text-sm select-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#484f58] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a626e] [scrollbar-width:thin] [scrollbar-color:#484f58_transparent]">

            <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1">Favorites</p>
                <ul>
                    {Object.entries(locations).map(([key, loc]) => (
                        <li
                            key={key}
                            className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors ${activeSide === key ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                            onClick={() => handleSideClick(key as keyof typeof locations)}
                        >
                            <img src={loc.icon} alt={loc.name} className="w-4 h-4" />
                            <span>{loc.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#484f58] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a626e] [scrollbar-width:thin] [scrollbar-color:#484f58_transparent]">
            <div className="grid grid-cols-4 gap-4">
                {currentFolder.children?.map((child: FinderItem) => (
                    <div
                        key={child.id}
                        className="flex flex-col items-center gap-1 group cursor-pointer p-2 rounded-md hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                        onClick={() => handleItemClick(child)}
                        onDoubleClick={() => handleItemClick(child)}
                    >
                        <img src={child.icon} alt={child.name} className="w-12 h-12 object-contain drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs text-center text-gray-300 font-medium px-1 rounded group-hover:text-white line-clamp-2 w-full break-words">
                            {child.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}

const FinderWindow = WindowWrapper(Finder, 'finder')

export default FinderWindow
