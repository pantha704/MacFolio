import { Search, Calculator, Calendar, Folder } from 'lucide-react'
import { useEffect, useRef } from 'react'

const Spotlight = ({ onClose }: { onClose: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]" onClick={onClose}>
        {/* Backdrop is handled by the parent or this div itself */}
      <div
        className="w-[600px] bg-[#1e1e1e]/80 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 px-4 py-4 border-b border-white/10">
            <Search className="w-6 h-6 text-gray-400" />
            <input
                ref={inputRef}
                type="text"
                placeholder="Spotlight Search"
                className="w-full bg-transparent text-2xl text-white placeholder-gray-500 outline-none font-light"
            />
        </div>

        <div className="p-2">
            <div className="px-3 py-1 text-xs text-gray-500 font-medium mb-1">Top Hits</div>

            <div className="flex items-center gap-3 px-3 py-2 hover:bg-blue-600 rounded-lg cursor-pointer group transition-colors">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">Calculator</span>
                    <span className="text-gray-400 text-xs group-hover:text-blue-200">Application</span>
                </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 hover:bg-blue-600 rounded-lg cursor-pointer group transition-colors">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">Projects</span>
                    <span className="text-gray-400 text-xs group-hover:text-blue-200">Folder</span>
                </div>
            </div>

             <div className="flex items-center gap-3 px-3 py-2 hover:bg-blue-600 rounded-lg cursor-pointer group transition-colors">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">Calendar</span>
                    <span className="text-gray-400 text-xs group-hover:text-blue-200">Application</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Spotlight
