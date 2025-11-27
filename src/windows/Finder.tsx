import { useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { locations } from '#constants'
import { ChevronLeft, ChevronRight, Search, LayoutGrid, List, HardDrive, Airplay, Clock, Download, AppWindow, Cloud } from 'lucide-react'

const Finder = () => {
  const [activeSide, setActiveSide] = useState<keyof typeof locations>('work')

  // Sidebar items
  const favorites = [
    { name: 'AirDrop', icon: Airplay, key: 'airdrop' },
    { name: 'Recents', icon: Clock, key: 'recents' },
    { name: 'Applications', icon: AppWindow, key: 'applications' },
    { name: 'Downloads', icon: Download, key: 'downloads' },
  ]

  const icloud = [
    { name: 'iCloud Drive', icon: Cloud, key: 'icloud' },
  ]

  const locationItems = [
    { name: 'Macintosh HD', icon: HardDrive, key: 'mac' },
  ]

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden font-georama border border-gray-800 shadow-2xl text-gray-200">
      {/* Header */}
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-[#2a2a2a] border-b border-gray-800">
        <WindowControls target="finder" />

        <div className="flex items-center gap-2 ml-4 text-gray-400">
          <ChevronLeft className="icon w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <ChevronRight className="icon w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>

        <span className="font-semibold text-gray-200 ml-2">
            {locations[activeSide]?.name || activeSide.charAt(0).toUpperCase() + activeSide.slice(1)}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-gray-400">
            <LayoutGrid className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            <List className="icon w-4 h-4 cursor-pointer hover:text-white transition-colors" />

            <div className="search flex items-center gap-2 bg-[#1a1a1a] px-2 py-1 rounded-md border border-gray-700/50 focus-within:border-blue-500/50 focus-within:bg-[#1a1a1a] transition-all shadow-inner w-40">
                <Search className="w-3 h-3 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 bg-transparent outline-none text-xs text-gray-300 placeholder-gray-600"
                />
            </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#252525]/80 backdrop-blur-xl border-r border-gray-800 p-2 overflow-y-auto text-sm select-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#484f58] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a626e] [scrollbar-width:thin] [scrollbar-color:#484f58_transparent]">

            <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1">Favorites</p>
                <ul>
                    {favorites.map((item) => (
                        <li key={item.key} className="flex items-center gap-2 px-2 py-1 rounded-md text-gray-400 hover:bg-white/10 cursor-default transition-colors">
                            <item.icon className="w-4 h-4 text-blue-400" />
                            <span>{item.name}</span>
                        </li>
                    ))}
                    {/* Map actual locations as favorites for now */}
                    {Object.entries(locations).map(([key, loc]) => (
                        <li
                            key={key}
                            className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors ${activeSide === key ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                            onClick={() => setActiveSide(key as keyof typeof locations)}
                        >
                            <img src={loc.icon} alt={loc.name} className="w-4 h-4" />
                            <span>{loc.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1">iCloud</p>
                <ul>
                    {icloud.map((item) => (
                        <li key={item.key} className="flex items-center gap-2 px-2 py-1 rounded-md text-gray-400 hover:bg-white/10 cursor-default transition-colors">
                            <item.icon className="w-4 h-4 text-blue-400" />
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-500 px-2 mb-1">Locations</p>
                <ul>
                    {locationItems.map((item) => (
                        <li key={item.key} className="flex items-center gap-2 px-2 py-1 rounded-md text-gray-400 hover:bg-white/10 cursor-default transition-colors">
                            <item.icon className="w-4 h-4 text-gray-500" />
                            <span>{item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#1e1e1e] p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#484f58] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a626e] [scrollbar-width:thin] [scrollbar-color:#484f58_transparent]">
            <div className="grid grid-cols-4 gap-4">
                {locations[activeSide]?.children.map((child: any) => (
                    <div key={child.id} className="flex flex-col items-center gap-1 group cursor-pointer p-2 rounded-md hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
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
