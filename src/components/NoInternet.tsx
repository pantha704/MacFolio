import { WifiOff } from 'lucide-react'

const NoInternet = () => {
  return (
    <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <WifiOff className="w-12 h-12 text-gray-400" />
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">No Internet Connection</h1>

      <p className="text-gray-400 text-lg max-w-md mb-8">
        You are currently offline. This portfolio requires an active internet connection to load the MacFolio experience.
      </p>

      <div className="bg-[#1e1e1e] border border-white/10 rounded-lg p-4 max-w-sm w-full text-left">
        <p className="text-gray-500 text-xs uppercase font-bold mb-2">Try the following:</p>
        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
            <li>Check your network cables, modem, and router.</li>
            <li>Reconnect to Wi-Fi using the menu bar icon.</li>
        </ul>
      </div>

      <p className="mt-12 text-gray-600 text-sm font-mono">ERR_INTERNET_DISCONNECTED</p>
    </div>
  )
}

export default NoInternet
