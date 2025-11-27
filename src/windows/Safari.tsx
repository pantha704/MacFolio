
import { useState, useRef, KeyboardEvent } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { PanelLeft, ChevronLeft, ChevronRight, ShieldHalf, Search, Share, Plus, Copy, RotateCw } from 'lucide-react'
import GitHubProfile from '#components/apps/GitHubProfile'
import { FaGithub } from 'react-icons/fa'
// import { FcGoogle } from 'react-icons/fc'
// import { SiJavascript } from 'react-icons/si'

const Safari = () => {
  const [history, setHistory] = useState<string[]>([''])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentUrl, setCurrentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<'start' | 'github'>('start')

  const inputRef = useRef<HTMLInputElement>(null)
  const startInputRef = useRef<HTMLInputElement>(null)

  const bookmarks = [
    // { name: 'Gemini', url: 'https://gemini.google.com', Icon: FcGoogle, color: 'bg-white' },
    // { name: 'JS Mastery', url: 'https://jsmastery.pro', Icon: SiJavascript, color: 'bg-yellow-400' },
    { name: 'GitHub', url: 'https://github.com/pantha704', Icon: FaGithub, color: 'bg-white/30 backdrop-blur-lg' },
  ]

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>, fromStartPage = false) => {
    if (e.key === 'Enter') {
      const input = fromStartPage ? startInputRef.current : inputRef.current
      const url = input?.value || ''
      if (!url) return

      processUrl(url)
    }
  }

  const processUrl = (url: string) => {
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
          finalUrl = 'https://' + url
      } else {
          // Search query -> Open Google in new tab
          window.open(`https://www.google.com/search?q=${encodeURIComponent(url)}`, '_blank')
          return
      }
    }
    navigate(finalUrl)
  }

  const navigate = (url: string) => {
    // Internal Routing Logic
    if (url.includes('github.com')) {
        setActiveView('github')
        setCurrentUrl(url)
    } else {
        // External Link -> Open in new tab
        window.open(url, '_blank')
        // Don't change view, just keep current state or maybe show a "Opened in new tab" toast?
        // For now, we'll just return.
        return
    }

    const newHistory = history.slice(0, currentIndex + 1)
    newHistory.push(url)
    setHistory(newHistory)
    setCurrentIndex(newHistory.length - 1)
  }

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      const prevUrl = history[newIndex]

      if (!prevUrl) {
          goHome()
      } else {
          navigate(prevUrl)
      }
    } else {
        goHome()
    }
  }

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      navigate(history[newIndex])
    }
  }

  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
    setTimeout(() => setIsLoading(false), 500)
  }

  const goHome = () => {
    setActiveView('start')
    setCurrentUrl('')
    setIsLoading(false)
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden font-georama relative shadow-2xl border border-gray-800">

      {/* Persistent Browser Header / Drag Handle */}
      <div className={`window-header ${activeView === 'start'
          ? 'absolute top-0 left-0 w-full z-50 px-4 h-14 flex items-center gap-4 bg-transparent border-none!'
          : 'grid grid-cols-[1fr_2fr_1fr] items-center bg-[#2a2a2a] border-none! px-4 h-14 gap-4'
      }`}>

        {activeView === 'start' ? (
             <div className="flex items-center gap-4">
                 <WindowControls target="safari" />
             </div>
        ) : (
            <>
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <WindowControls target="safari" />
                    </div>

                    <div className="flex items-center gap-2 ml-2 text-gray-400">
                        <PanelLeft className="icon w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                        <div className="flex gap-1">
                            <ChevronLeft
                                className={`icon w-5 h-5 transition-colors ${currentIndex > 0 ? 'cursor-pointer hover:text-white' : 'text-gray-600'}`}
                                onClick={goBack}
                            />
                            <ChevronRight
                                className={`icon w-5 h-5 transition-colors ${currentIndex < history.length - 1 ? 'cursor-pointer hover:text-white' : 'text-gray-600'}`}
                                onClick={goForward}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <ShieldHalf className="icon w-4 h-4 text-gray-500" />

                    <div className="search flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-lg w-full max-w-xl border border-transparent focus-within:border-blue-500/50 transition-all shadow-inner">
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                            <span className="text-gray-400">AA</span>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600 text-center focus:text-left transition-all"
                            placeholder="Search or enter website name"
                            defaultValue={currentUrl}
                            onKeyDown={(e) => handleSearch(e)}
                        />
                        <RotateCw
                            className={`icon w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-white transition-all ${isLoading ? 'animate-spin' : ''}`}
                            onClick={handleRefresh}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 text-gray-400">
                    <Share className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                    <Plus className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                    <Copy className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                </div>
            </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">

        {/* Start Page */}
        {activeView === 'start' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 transition-opacity duration-700"
                    style={{ backgroundImage: `url('/images/wallpaper.png')` }}
                ></div>

                <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-500">
                    <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight drop-shadow-2xl">Safari</h1>

                    <div className="w-full relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            ref={startInputRef}
                            type="text"
                            className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/20 transition-all shadow-2xl text-lg"
                            placeholder="Search Google or enter a website name"
                            onKeyDown={(e) => handleSearch(e, true)}
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                        {bookmarks.map((bm, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-3 group cursor-pointer"
                                onClick={() => processUrl(bm.url)}
                            >
                                <div className={`w-16 h-16 ${bm.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <bm.Icon className="w-8 h-8" />
                                </div>
                                <span className="text-white text-sm font-medium drop-shadow-md group-hover:text-blue-300 transition-colors">{bm.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* GitHub View */}
        {activeView === 'github' && (
            <GitHubProfile key={refreshKey} />
        )}

      </div>
    </div>
  )
}

const SafariWindow = WindowWrapper(Safari, 'safari')

export default SafariWindow

