import { useState } from 'react'
import { Wifi, Bluetooth, Monitor, Moon, Sun, Volume2, Mic, Cast, Copy } from 'lucide-react'

const ControlCenter = () => {
  const [brightness, setBrightness] = useState(100)
  const [volume, setVolume] = useState(80)

  return (
    <div className="absolute top-8 right-0 w-80 bg-[#1e1e1e]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-3 text-white z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-3">

      {/* Top Section: Connectivity & Media */}
      <div className="grid grid-cols-2 gap-3">
        {/* Connectivity Block */}
        <div className="bg-[#2b2b2b]/50 rounded-xl p-2 flex flex-col gap-2">
            <div className="flex items-center gap-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-sm font-medium">Wi-Fi</span>
                    <span className="text-[10px] text-gray-400">Home WiFi</span>
                </div>
            </div>
            <div className="flex items-center gap-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bluetooth className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-sm font-medium">Bluetooth</span>
                    <span className="text-[10px] text-gray-400">On</span>
                </div>
            </div>
            <div className="flex items-center gap-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <Cast className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-sm font-medium">AirDrop</span>
                    <span className="text-[10px] text-gray-400">Contacts Only</span>
                </div>
            </div>
        </div>

        {/* Other Toggles */}
        <div className="grid grid-rows-2 gap-3">
            <div className="bg-[#2b2b2b]/50 rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Moon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Do Not Disturb</span>
            </div>
            <div className="bg-[#2b2b2b]/50 rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
                    <Copy className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Screen Mirroring</span>
            </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-[#2b2b2b]/50 rounded-xl p-3 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1">Display</div>
            <div className="bg-black/20 rounded-full h-7 relative overflow-hidden group">
                <div
                    className="absolute top-0 left-0 h-full bg-white transition-all duration-75"
                    style={{ width: `${brightness}%` }}
                ></div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="absolute top-0 left-0 h-full w-full flex items-center px-2 pointer-events-none">
                    <Sun className={`w-4 h-4 z-20 ${brightness > 50 ? 'text-gray-800' : 'text-white'}`} />
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1">Sound</div>
            <div className="bg-black/20 rounded-full h-7 relative overflow-hidden group">
                <div
                    className="absolute top-0 left-0 h-full bg-white transition-all duration-75"
                    style={{ width: `${volume}%` }}
                ></div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="absolute top-0 left-0 h-full w-full flex items-center px-2 pointer-events-none">
                    <Volume2 className={`w-4 h-4 z-20 ${volume > 50 ? 'text-gray-800' : 'text-white'}`} />
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Toggles */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-[#2b2b2b]/50 rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
                <Monitor className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Stage Manager</span>
        </div>
        <div className="bg-[#2b2b2b]/50 rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400">
                <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Mic Mode</span>
        </div>
      </div>

    </div>
  )
}

export default ControlCenter
