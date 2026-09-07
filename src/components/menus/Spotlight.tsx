import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Folder,
  Terminal as TerminalIcon,
  Images,
  Github,
  Mail,
  FileText,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { locations } from '#constants'
import { useWindowStore } from '#store/useWindowStore'

interface SpotlightResult {
  id: string
  label: string
  detail: string
  keywords: string
  Icon: LucideIcon
  run: () => void
}

const Spotlight = ({ onClose }: { onClose: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const openWindow = useWindowStore((state) => state.openWindow)

  const results = useMemo<SpotlightResult[]>(() => {
    const projectResults: SpotlightResult[] = (locations.work.children ?? []).map((project) => ({
      id: `project-${project.id}`,
      label: project.name,
      detail: 'Project · Finder',
      keywords: `${project.name} project work code repository`,
      Icon: Folder,
      run: () => openWindow('finder', { activeSide: 'work', openFolder: project.name }),
    }))

    return [
      {
        id: 'projects',
        label: 'Projects',
        detail: 'Finder · Work',
        keywords: 'projects work portfolio code',
        Icon: Folder,
        run: () => openWindow('finder', { activeSide: 'work' }),
      },
      {
        id: 'about',
        label: 'About Pratham',
        detail: 'Finder · About me',
        keywords: 'about bio profile pratham',
        Icon: UserRound,
        run: () => openWindow('finder', { activeSide: 'about' }),
      },
      {
        id: 'resume',
        label: 'Resume',
        detail: 'Finder · Resume',
        keywords: 'resume cv experience skills',
        Icon: FileText,
        run: () => openWindow('finder', { activeSide: 'resume' }),
      },
      {
        id: 'github',
        label: 'GitHub',
        detail: 'Safari · pantha704',
        keywords: 'github repositories code open source',
        Icon: Github,
        run: () => openWindow('safari'),
      },
      {
        id: 'terminal',
        label: 'Terminal',
        detail: 'Interactive shell',
        keywords: 'terminal shell stack tech commands',
        Icon: TerminalIcon,
        run: () => openWindow('terminal'),
      },
      {
        id: 'photos',
        label: 'Photos',
        detail: 'Gallery & wallpapers',
        keywords: 'photos gallery images wallpaper',
        Icon: Images,
        run: () => openWindow('photos'),
      },
      {
        id: 'contact',
        label: 'Contact',
        detail: 'Email & social links',
        keywords: 'contact email social hire',
        Icon: Mail,
        run: () => openWindow('contact'),
      },
      ...projectResults,
    ]
  }, [openWindow])

  const filteredResults = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return results.slice(0, 7)

    return results.filter((result) =>
      `${result.label} ${result.detail} ${result.keywords}`.toLowerCase().includes(normalized),
    ).slice(0, 9)
  }, [query, results])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const execute = (result: SpotlightResult) => {
    result.run()
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onClose()
      return
    }

    if (filteredResults.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((index) => (index + 1) % filteredResults.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((index) => (index - 1 + filteredResults.length) % filteredResults.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      execute(filteredResults[selectedIndex])
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/10 px-4 pt-[17vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/20 bg-[#171717]/72 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-3xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight"
      >
        <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4">
          <Search className="w-6 h-6 text-gray-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search apps, projects, resume…"
            className="w-full bg-transparent text-xl sm:text-2xl text-white placeholder-gray-500 outline-none font-light"
            aria-label="Search MacFolio"
          />
          <kbd className="hidden sm:block rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400">ESC</kbd>
        </div>

        <div className="p-2" role="listbox" aria-label="Search results">
          <div className="px-3 py-1.5 text-[11px] font-medium text-gray-500">
            {query ? 'Results' : 'Quick Access'}
          </div>

          {filteredResults.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500">No matches</p>
          ) : (
            filteredResults.map((result, index) => (
              <button
                type="button"
                key={result.id}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selectedIndex === index ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-white/8'}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => execute(result)}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/10 border border-white/10">
                  <result.Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{result.label}</span>
                  <span className={`block truncate text-xs ${selectedIndex === index ? 'text-blue-100' : 'text-gray-500'}`}>{result.detail}</span>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="hidden sm:flex items-center justify-end gap-3 border-t border-white/10 px-4 py-2 text-[10px] text-gray-500">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
        </div>
      </div>
    </div>
  )
}

export default Spotlight
