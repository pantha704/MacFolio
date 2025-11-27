import { Wifi, Check } from 'lucide-react'
import { useSystemStore } from '../../store/systemStore'

const WifiMenu = () => {
  const { isWifiEnabled, setWifi } = useSystemStore()

  return (
    <div className="absolute top-8 right-0 w-80 bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-2 text-white z-50 animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
      {/* Header: Wi-Fi | Toggle */}
      <div className="flex items-center justify-between px-3 py-2 gap-2">
        <span className="font-semibold text-sm text-center w-12">Wi-Fi</span>
        <label className="relative ml-4 inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isWifiEnabled}
            onChange={() => setWifi(!isWifiEnabled)}
          />
          <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>

      {/* Active Network or Off State */}
      <div className="px-2 pb-1">
        {isWifiEnabled ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-md">
                <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-white">Home WiFi</span>
                    </div>
                </div>
                <Check className="w-3 h-3 text-blue-400" />
            </div>
        ) : (
            <div className="px-3 py-2 text-gray-500 text-sm flex items-center gap-3">
                <Wifi className="w-4 h-4 opacity-50" />
                <span>Wi-Fi is turned off</span>
            </div>
        )}
      </div>
    </div>
  )
}

export default WifiMenu
