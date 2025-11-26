

import WindowControls from '../components/WindowControls'
import { PanelLeft, ChevronLeft, ChevronRight, ShieldHalf, Search, Share, Plus, Copy } from 'lucide-react'
import { blogPosts } from '#constants'

const Safari = () => {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <WindowControls target="safari" />

        <PanelLeft className="ml-4 icon w-5 h-5 text-gray-500 cursor-pointer hover:text-black transition-colors" />

        <div className="flex items-center gap-2 ml-2 text-gray-500">
          <ChevronLeft className="icon w-5 h-5 cursor-pointer hover:text-black transition-colors" />
          <ChevronRight className="icon w-5 h-5 cursor-pointer hover:text-black transition-colors" />
        </div>

        <div className="flex-1 flex items-center justify-center gap-3">
            <ShieldHalf className="icon w-4 h-4 text-gray-500" />

            <div className="search flex items-center gap-2 bg-gray-200/50 px-3 py-1.5 rounded-lg w-full max-w-md border border-gray-300/50 focus-within:border-blue-400 focus-within:bg-white transition-all shadow-sm">
                <Search className="icon w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search or enter website name"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                />
            </div>
        </div>

        <div className="flex items-center gap-4 text-gray-500">
            <Share className="icon w-4 h-4 cursor-pointer hover:text-black transition-colors" />
            <Plus className="icon w-4 h-4 cursor-pointer hover:text-black transition-colors" />
            <Copy className="icon w-4 h-4 cursor-pointer hover:text-black transition-colors" />
        </div>
      </div>

      {/* Content */}
      <div className="blog flex-1 overflow-y-auto p-8 bg-white">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">My Developer Blog</h2>

        <div className="space-y-8">
          {blogPosts.map((post) => (
            <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="block group"
            >
                <div className="flex gap-6 items-start p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-48 h-32 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                    />
                    <div className="flex-1">
                        <span className="text-sm text-gray-500 font-medium">{post.date}</span>
                        <h3 className="text-xl font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-gray-600 mt-2 line-clamp-2">
                          Read more about {post.title} on JavaScript Mastery...
                        </p>
                    </div>
                </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Safari

