import { useEffect, useMemo, useState } from 'react'
import { Book, ExternalLink, GitFork, MapPin, Search, Star, Users } from 'lucide-react'
import { profile } from '../../data/portfolio'

type GitHubUser = { login: string; avatar_url: string; name: string | null; bio: string | null; public_repos: number; followers: number; following: number; location: string | null; html_url: string }
type GitHubRepo = { id: number; name: string; description: string | null; language: string | null; stargazers_count: number; forks_count: number; html_url: string; updated_at: string; fork: boolean; archived: boolean }
type Cache = { user: GitHubUser; repos: GitHubRepo[]; starred: GitHubRepo[]; savedAt: number }

let memoryCache: Cache | null = null
const githubUrl = (value: unknown) => typeof value === 'string' && /^https:\/\/github\.com\//.test(value) ? value : profile.github
const getJson = async <T,>(url: string, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal, headers: { Accept: 'application/vnd.github+json' } })
  if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'GitHub’s public request limit was reached.' : 'GitHub did not respond.')
  return response.json() as Promise<T>
}

export default function GitHubProfile() {
  const [data, setData] = useState<Cache | null>(memoryCache)
  const [loading, setLoading] = useState(!memoryCache)
  const [error, setError] = useState('')
  const [starsError, setStarsError] = useState(false)
  const [tab, setTab] = useState<'overview' | 'repositories' | 'stars'>('overview')
  const [query, setQuery] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    let active = true
    setLoading(!data)
    setError('')
    setStarsError(false)
    void Promise.all([
      getJson<GitHubUser>('https://api.github.com/users/pantha704', controller.signal),
      getJson<GitHubRepo[]>('https://api.github.com/users/pantha704/repos?sort=updated&per_page=30', controller.signal),
    ]).then(async ([user, repos]) => {
      if (!user?.login || !Array.isArray(repos)) throw new Error('GitHub returned an unexpected response.')
      let starred: GitHubRepo[] = []
      try { starred = await getJson<GitHubRepo[]>('https://api.github.com/users/pantha704/starred?sort=created&per_page=10', controller.signal) } catch { if (active) setStarsError(true) }
      if (!active) return
      memoryCache = { user: { ...user, html_url: githubUrl(user.html_url) }, repos: repos.map(repo => ({ ...repo, html_url: githubUrl(repo.html_url) })), starred: starred.map(repo => ({ ...repo, html_url: githubUrl(repo.html_url) })), savedAt: Date.now() }
      setData(memoryCache)
    }).catch(reason => {
      if (active) setError(reason instanceof Error && reason.name !== 'AbortError' ? reason.message : 'The GitHub request timed out.')
    }).finally(() => { clearTimeout(timeout); if (active) setLoading(false) })
    return () => { active = false; clearTimeout(timeout); controller.abort() }
  // A retry intentionally refreshes the in-memory snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  const shown = useMemo(() => {
    const source = tab === 'stars' ? data?.starred ?? [] : data?.repos ?? []
    const text = query.trim().toLowerCase()
    return source.filter(repo => !text || `${repo.name} ${repo.description ?? ''} ${repo.language ?? ''}`.toLowerCase().includes(text))
  }, [data, query, tab])

  if (!data && loading) return <div className="github-state" role="status"><span className="github-spinner"/>Loading public GitHub profile…</div>
  if (!data) return <div className="github-state" role="alert"><h2>GitHub couldn’t load right now.</h2><p>{error || 'The connection may be unavailable.'}</p><div><button className="secondary-action" onClick={() => setAttempt(value => value + 1)}>Try again</button><a className="secondary-action" href={profile.github} target="_blank" rel="noopener noreferrer">Open GitHub</a></div></div>
  const { user } = data
  return <div className="github-app">
    <header className="github-profile"><img src={user.avatar_url} alt={user.name ?? user.login} crossOrigin="anonymous"/><div><h2>{user.name ?? user.login}</h2><span>@{user.login}</span><p>{user.bio}</p><div className="github-meta"><span><Users size={15}/><strong>{user.followers}</strong> followers · {user.following} following</span>{user.location && <span><MapPin size={15}/>{user.location}</span>}</div></div><a className="secondary-action" href={user.html_url} target="_blank" rel="noopener noreferrer">View profile <ExternalLink size={15}/></a></header>
    <nav className="github-tabs" aria-label="GitHub sections"><button aria-current={tab === 'overview' ? 'page' : undefined} onClick={() => setTab('overview')}><Book size={16}/>Overview</button><button aria-current={tab === 'repositories' ? 'page' : undefined} onClick={() => setTab('repositories')}>Repositories <span>{user.public_repos}</span></button><button aria-current={tab === 'stars' ? 'page' : undefined} onClick={() => setTab('stars')}><Star size={16}/>Stars</button></nav>
    {tab === 'overview' ? <section className="github-content"><div className="github-section-title"><h3>Recently updated</h3><small>Refreshed {new Date(data.savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div><RepoGrid repos={data.repos.slice(0, 6)}/>{starsError && <p className="github-note">Starred repositories couldn’t be refreshed, but the profile and repositories are available.</p>}</section> : <section className="github-content"><label className="github-search"><Search size={16}/><input aria-label={tab === 'stars' ? 'Search starred repositories' : 'Search repositories'} value={query} onChange={event => setQuery(event.target.value)} placeholder={`Find ${tab === 'stars' ? 'a starred repository' : 'a repository'}…`}/></label>{tab === 'stars' && starsError && <p className="github-note">Starred repositories are temporarily unavailable.</p>}<RepoList repos={shown}/></section>}
  </div>
}

function RepoGrid({ repos }: { repos: GitHubRepo[] }) {
  return <div className="github-grid">{repos.map(repo => <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer"><div><Book size={15}/><strong>{repo.name}</strong>{repo.archived && <span>Archived</span>}</div><p>{repo.description || 'Public repository'}</p><RepoMeta repo={repo}/></a>)}</div>
}
function RepoList({ repos }: { repos: GitHubRepo[] }) {
  if (!repos.length) return <p className="empty-state">No matching repositories.</p>
  return <div className="github-list">{repos.map(repo => <article key={repo.id}><div><a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.name}</a>{repo.fork && <span>Fork</span>}{repo.archived && <span>Archived</span>}</div><p>{repo.description || 'Public repository'}</p><RepoMeta repo={repo}/></article>)}</div>
}
function RepoMeta({ repo }: { repo: GitHubRepo }) {
  return <small>{repo.language && <span>{repo.language}</span>}<span><Star size={13}/>{repo.stargazers_count}</span><span><GitFork size={13}/>{repo.forks_count}</span><span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span></small>
}
