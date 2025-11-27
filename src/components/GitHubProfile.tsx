import { useState, useEffect } from 'react'
import { MapPin, Link as LinkIcon, Users, Star, GitFork, BookMarked, Circle } from 'lucide-react'

interface UserData {
  login: string
  avatar_url: string
  name: string
  bio: string
  followers: number
  following: number
  public_repos: number
  location: string
  blog: string
  html_url: string
}

interface RepoData {
  id: number
  name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  html_url: string
}

const GitHubProfile = ({ username }: { username: string }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [repos, setRepos] = useState<RepoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch User
        const userRes = await fetch(`https://api.github.com/users/${username}`)
        if (!userRes.ok) throw new Error('User not found')
        const userData = await userRes.json()
        setUser(userData)

        // Fetch Repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
        if (!reposRes.ok) throw new Error('Repos not found')
        const reposData = await reposRes.json()
        setRepos(reposData)
      } catch (err) {
        setError('Failed to load GitHub profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) fetchData()
  }, [username])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d1117] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1117] text-gray-400 gap-4">
        <p className="text-xl">{error}</p>
        <button onClick={() => window.open(`https://github.com/${username}`, '_blank')} className="text-blue-400 hover:underline">
            Open on GitHub
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto font-sans">
      {/* Navbar Mock */}
      <div className="bg-[#161b22] border-b border-[#30363d] p-4 flex items-center gap-4 sticky top-0 z-10">
        <div className="font-bold text-xl flex items-center gap-2">
            <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true" fill="white">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <span>{user.login}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
            <img src={user.avatar_url} alt={user.login} className="w-full rounded-full border border-[#30363d]" />
            <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-xl text-[#8b949e]">{user.login}</p>
            </div>
            <p className="text-white">{user.bio}</p>
            <button className="w-full bg-[#21262d] border border-[#30363d] text-white py-1.5 rounded-md font-medium hover:bg-[#30363d] transition-colors">
                Follow
            </button>

            <div className="flex flex-col gap-2 text-sm text-[#8b949e]">
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
                        <a href={user.blog} target="_blank" rel="noreferrer" className="text-white hover:text-blue-400 hover:underline truncate">
                            {user.blog}
                        </a>
                    </div>
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#30363d] mb-6 overflow-x-auto">
                <div className="pb-3 border-b-2 border-[#f78166] flex items-center gap-2 font-medium text-white cursor-pointer">
                    <BookMarked className="w-4 h-4" />
                    Overview
                </div>
                <div className="pb-3 flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] cursor-pointer">
                    <BookMarked className="w-4 h-4" />
                    Repositories <span className="bg-[#30363d] px-2 py-0.5 rounded-full text-xs text-white">{user.public_repos}</span>
                </div>
                <div className="pb-3 flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] cursor-pointer">
                    <GitFork className="w-4 h-4" />
                    Projects
                </div>
            </div>

            {/* Pinned/Top Repos */}
            <h2 className="text-white font-medium mb-4">Popular repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map(repo => (
                    <div key={repo.id} className="border border-[#30363d] bg-[#0d1117] p-4 rounded-md flex flex-col justify-between gap-4 hover:border-[#8b949e] transition-colors cursor-pointer" onClick={() => window.open(repo.html_url, '_blank')}>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-[#58a6ff] font-bold hover:underline truncate text-sm">
                                    {repo.name}
                                </a>
                                <span className="text-xs border border-[#30363d] rounded-full px-2 py-0.5 text-[#8b949e]">Public</span>
                            </div>
                            <p className="text-xs text-[#8b949e] line-clamp-2 h-8">
                                {repo.description || 'No description available'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                            {repo.language && (
                                <div className="flex items-center gap-1">
                                    <Circle className="w-3 h-3 fill-[#f1e05a] text-[#f1e05a]" />
                                    {repo.language}
                                </div>
                            )}
                            <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                <Star className="w-4 h-4" />
                                {repo.stargazers_count}
                            </div>
                            <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                                <GitFork className="w-4 h-4" />
                                {repo.forks_count}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contribution Graph Mock */}
            <div className="mt-8">
                <h2 className="text-white font-medium mb-4">Contribution activity</h2>
                <div className="border border-[#30363d] rounded-md p-4 bg-[#0d1117] flex items-center justify-center h-32 text-[#8b949e]">
                    Contribution graph visualization would go here.
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default GitHubProfile
