import { Lock, LogOut } from 'lucide-react'

const UserMenu = () => {
  return (
    <div className="absolute top-8 right-0 w-64 bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-1 text-white z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
            P
        </div>
        <div>
            <div className="font-medium">Pratham</div>
            <div className="text-xs text-gray-400">Apple ID</div>
        </div>
      </div>

      <div className="p-1">
        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-500 rounded-md cursor-pointer transition-colors group">
            <Lock className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <span className="text-sm">Lock Screen</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-500 rounded-md cursor-pointer transition-colors group">
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <span className="text-sm">Log Out...</span>
        </div>
      </div>
    </div>
  )
}

export default UserMenu
