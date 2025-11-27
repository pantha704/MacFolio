
import { useState, useEffect } from 'react'
import { MapPin, Link as LinkIcon, Twitter, Users, Star, GitBranch, Book } from 'lucide-react'
interface GitHubUser {
  login: string
  avatar_url: string
  name: string
  bio: string
  public_repos: number
  followers: number
  following: number
  location: string
  blog: string
  twitter_username: string
  html_url: string
  created_at: string
}

interface GitHubRepo {
  name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  html_url: string
  visibility: string
  updated_at: string
}

const GitHubProfile = () => {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [starred, setStarred] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories'>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const languageColors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    React: '#61dafb',
    Svelte: '#ff3e00',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = Date.now()
        const [userRes, reposRes, starredRes] = await Promise.all([
          fetch(`https://api.github.com/users/pantha704?t=${timestamp}`),
          fetch(`https://api.github.com/users/pantha704/repos?sort=updated&per_page=30&t=${timestamp}`),
          fetch(`https://api.github.com/users/pantha704/starred?sort=created&per_page=10&t=${timestamp}`)
        ])

        const userData = await userRes.json()
        const reposData = await reposRes.json()
        const starredData = await starredRes.json()

        setUser(userData)
        setRepos(reposData)
        setStarred(starredData)
      } catch (error) {
        console.error('Error fetching GitHub data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
        <div className="w-full h-full bg-[#0d1117] flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    )
  }

  if (!user) return null

  return (
    <div className="w-full h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto font-sans [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0d1117] [&::-webkit-scrollbar-thumb]:bg-[#30363d] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#484f58] [scrollbar-width:thin] [scrollbar-color:#30363d_#0d1117]">
      {/* Header / Nav */}
      <div className="bg-[#161b22] border-b border-[#30363d] py-4 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" aria-hidden="true"><path fill="#161b22" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
            </div>
            <span className="font-semibold text-white">{user.login}</span>
        </div>
        <div className="hidden md:flex gap-4 text-sm font-semibold">
            <a href="https://github.com/pulls" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-white">Pull requests</a>
            <a href="https://github.com/issues" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-white">Issues</a>
            <a href="https://github.com/codespaces" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-white">Codespaces</a>
            <a href="https://github.com/marketplace" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-white">Marketplace</a>
            <a href="https://github.com/explore" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-white">Explore</a>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto md:flex md:gap-8 p-4 md:p-8">
        {/* Sidebar */}
        <div className="md:w-1/4 flex flex-col gap-4 mb-8 md:mb-0">
            <div className="relative group">
                <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="w-full rounded-full border border-[#30363d] shadow-lg z-10 relative"
                />
                <div className="absolute bottom-10 right-0 bg-[#30363d] p-2 rounded-full border border-[#6e7681] cursor-pointer hover:bg-[#30363d]/80 z-20">
                    <span className="text-xs">🎯</span>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <h2 className="text-xl text-[#8b949e] font-light">{user.login}</h2>
            </div>

            <a href={user.html_url} target="_blank" rel="noreferrer" className="w-full bg-[#21262d] border border-[#30363d] text-white py-1.5 rounded-md text-sm font-medium hover:bg-[#30363d] transition-colors text-center">
                View profile
            </a>

            <div className="flex flex-col gap-2 text-sm text-[#8b949e]">
                <p className="text-white mb-2">{user.bio}</p>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-white font-bold">{user.followers}</span> followers · <span className="text-white font-bold">{user.following}</span> following
                </div>
                {user.location && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                    </div>
                )}
                {user.blog && (
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline truncate">
                            {user.blog}
                        </a>
                    </div>
                )}
                {user.twitter_username && (
                    <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">@{user.twitter_username}</a>
                    </div>
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#30363d] mb-6 overflow-x-auto sticky top-[73px] bg-[#0d1117] z-10 pt-2">
                <div
                    className={`flex items-center gap-2 py-2 border-b-2 ${activeTab === 'overview' ? 'border-[#f78166] text-white font-semibold' : 'border-transparent text-[#8b949e] hover:text-white'} cursor-pointer transition-colors`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Book className="w-4 h-4" />
                    Overview
                </div>
                <div
                    className={`flex items-center gap-2 py-2 border-b-2 ${activeTab === 'repositories' ? 'border-[#f78166] text-white font-semibold' : 'border-transparent text-[#8b949e] hover:text-white'} cursor-pointer transition-colors`}
                    onClick={() => setActiveTab('repositories')}
                >
                    <GitBranch className="w-4 h-4" />
                    Repositories <span className="bg-[#30363d] px-2 rounded-full text-xs">{user.public_repos}</span>
                </div>
                <div className="flex items-center gap-2 py-2 text-[#8b949e] hover:text-white cursor-pointer border-b-2 border-transparent">
                    <Star className="w-4 h-4" />
                    Stars
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-white font-medium mb-4">Pinned</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {repos.slice(0, 6).map((repo) => (
                            <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" className="border border-[#30363d] rounded-md p-4 flex flex-col justify-between hover:border-[#8b949e] transition-colors cursor-pointer bg-[#0d1117] group">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Book className="w-4 h-4 text-[#8b949e]" />
                                        <span className="text-[#58a6ff] font-semibold group-hover:underline">{repo.name}</span>
                                        <span className="border border-[#30363d] rounded-full px-2 text-xs text-[#8b949e] font-medium capitalize">{repo.visibility}</span>
                                    </div>
                                    <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{repo.description}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                                    {repo.language && (
                                        <div className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: languageColors[repo.language] || '#8b949e' }}></span>
                                            {repo.language}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                        <Star className="w-4 h-4" />
                                        {repo.stargazers_count}
                                    </div>
                                    <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                        <GitBranch className="w-4 h-4" />
                                        {repo.forks_count}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <h2 className="text-white font-medium mb-4">Starred Repositories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {starred.map((repo) => (
                            <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" className="border border-[#30363d] rounded-md p-4 flex flex-col justify-between hover:border-[#8b949e] transition-colors cursor-pointer bg-[#0d1117] group">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Book className="w-4 h-4 text-[#8b949e]" />
                                        <span className="text-[#58a6ff] font-semibold group-hover:underline">{repo.name}</span>
                                        <span className="border border-[#30363d] rounded-full px-2 text-xs text-[#8b949e] font-medium capitalize">{repo.visibility}</span>
                                    </div>
                                    <p className="text-sm text-[#8b949e] mb-4 line-clamp-2">{repo.description}</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                                    {repo.language && (
                                        <div className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: languageColors[repo.language] || '#8b949e' }}></span>
                                            {repo.language}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                        <Star className="w-4 h-4" />
                                        {repo.stargazers_count}
                                    </div>
                                    <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                        <GitBranch className="w-4 h-4" />
                                        {repo.forks_count}
                                    </div>
                                </div>
                            </a>
                        ))}
                        {starred.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-[#8b949e] border border-[#30363d] rounded-md border-dashed">
                                No starred repositories found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'repositories' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Find a repository..."
                                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-3 pr-3 text-white placeholder-[#8b949e] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] outline-none text-sm transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="bg-[#238636] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#2ea043] transition-colors flex items-center gap-2">
                            <Book className="w-4 h-4" /> New
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {filteredRepos.map((repo) => (
                            <div key={repo.name} className="border-b border-[#30363d] pb-6 last:border-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-[#58a6ff] font-bold text-xl hover:underline">
                                                {repo.name}
                                            </a>
                                            <span className="border border-[#30363d] rounded-full px-2 text-xs text-[#8b949e] font-medium capitalize">{repo.visibility}</span>
                                        </div>
                                        <p className="text-sm text-[#8b949e] mb-3 max-w-xl">{repo.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                                            {repo.language && (
                                                <div className="flex items-center gap-1">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: languageColors[repo.language] || '#8b949e' }}></span>
                                                    {repo.language}
                                                </div>
                                            )}
                                            {repo.stargazers_count > 0 && (
                                                <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                                    <Star className="w-4 h-4" />
                                                    {repo.stargazers_count}
                                                </div>
                                            )}
                                            {repo.forks_count > 0 && (
                                                <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                                    <GitBranch className="w-4 h-4" />
                                                    {repo.forks_count}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                Updated on {formatDate(repo.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="bg-[#21262d] border border-[#30363d] text-[#c9d1d9] px-3 py-1 rounded-md text-xs font-medium hover:bg-[#30363d] transition-colors flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Star
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredRepos.length === 0 && (
                            <div className="text-center py-10 text-[#8b949e]">
                                No repositories found matching '{searchQuery}'
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default GitHubProfile
