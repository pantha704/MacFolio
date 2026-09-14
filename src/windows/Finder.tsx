import { useCallback, useEffect, useMemo, useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { locations } from '#constants'
import { useWindowStore } from '#store/useWindowStore'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Grid2X2,
  List,
  Search,
} from 'lucide-react'
import { profile, projects } from '../data/portfolio'

type Side = keyof typeof locations
type FinderData = { activeSide?: Side; projectId?: string }
type Location = { side: Side; projectId: string | null }

const FinderContent = ({ initial }: { initial?: FinderData }) => {
  const first: Location = {
    side: initial?.projectId ? 'work' : (initial?.activeSide ?? 'work'),
    projectId: initial?.projectId ?? null,
  }
  const [history, setHistory] = useState<Location[]>([first])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<'featured' | 'name' | 'category'>('featured')
  const open = useWindowStore((state) => state.openWindow)
  const location = history[historyIndex]
  const project = projects.find((item) => item.id === location.projectId)
  const filtered = useMemo(() => {
    const found = projects.filter((item) =>
      `${item.name} ${item.category} ${item.tags.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    if (sort === 'name')
      return [...found].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'category')
      return [...found].sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
      )
    return found
  }, [query, sort])
  const navigate = useCallback(
    (next: Location) => {
      setHistory((current) => [...current.slice(0, historyIndex + 1), next])
      setHistoryIndex((index) => index + 1)
      setQuery('')
    },
    [historyIndex],
  )
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !document.querySelector('dialog[open]') &&
        useWindowStore.getState().focusedWindow === 'finder' &&
        project
      )
        navigate({ side: 'work', projectId: null })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, project])

  return (
    <div className="finder-app">
      <div className="window-header finder-titlebar">
        <WindowControls target="finder" />
        <div className="finder-history" data-window-no-drag>
          <button
            aria-label="Back"
            disabled={historyIndex === 0}
            onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}
          >
            <ArrowLeft size={17} />
          </button>
          <button
            aria-label="Forward"
            disabled={historyIndex >= history.length - 1}
            onClick={() =>
              setHistoryIndex((index) =>
                Math.min(history.length - 1, index + 1),
              )
            }
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <div className="finder-path">
          <span>{locations[location.side].name}</span>
          {project && (
            <>
              <ChevronRight size={14} />
              <strong>{project.name}</strong>
            </>
          )}
        </div>
      </div>
      <div className="finder-layout">
        <aside className="finder-sidebar" aria-label="Finder folders">
          <p className="sidebar-label">Favorites</p>
          {Object.entries(locations).map(([key, item]) => (
            <button
              key={key}
              title={item.name}
              aria-label={item.name}
              aria-current={
                location.side === key && !project ? 'page' : undefined
              }
              onClick={() => navigate({ side: key as Side, projectId: null })}
            >
              <img src={item.icon} alt="" />
              <span>{item.name}</span>
            </button>
          ))}
        </aside>
        <div className="finder-main">
          {location.side === 'work' && (
            <>
              <div className="finder-toolbar">
                <div className="finder-search">
                  <Search size={17} />
                  <input
                    aria-label="Filter projects"
                    placeholder="Find a project or technology…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="finder-view-controls" data-window-no-drag>
                  <select
                    aria-label="Sort projects"
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as typeof sort)
                    }
                  >
                    <option value="featured">Featured</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                  </select>
                  <div role="group" aria-label="View projects">
                    <button
                      aria-pressed={view === 'grid'}
                      onClick={() => setView('grid')}
                      aria-label="Icon view"
                    >
                      <Grid2X2 size={16} />
                    </button>
                    <button
                      aria-pressed={view === 'list'}
                      onClick={() => setView('list')}
                      aria-label="List view"
                    >
                      <List size={17} />
                    </button>
                  </div>
                </div>
              </div>
              {project ? (
                <article className="project-detail">
                  <button
                    className="finder-back-label"
                    onClick={() => navigate({ side: 'work', projectId: null })}
                  >
                    <ArrowLeft size={16} />
                    All projects
                  </button>
                  <span className="project-category">{project.category}</span>
                  <h2>{project.name}</h2>
                  <p>{project.description}</p>
                  <h3>What it explores</h3>
                  <p>
                    {project.name === 'MacFolio'
                      ? 'A portfolio that behaves like a small personal operating environment—useful first, playful when explored.'
                      : `A focused ${project.category.toLowerCase()} project, available publicly for a closer look at the implementation.`}
                  </p>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.links.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          index === 0 ? 'primary-action' : 'secondary-action'
                        }
                      >
                        {link.label}
                        <ArrowUpRight size={16} />
                      </a>
                    ))}
                  </div>
                </article>
              ) : (
                <>
                  <div className="finder-heading">
                    <div>
                      <h2>Things I’ve built.</h2>
                      <p className="finder-subtitle">
                        Automation, developer tools, and experiments on the web.
                      </p>
                    </div>
                    <span>{filtered.length} projects</span>
                  </div>
                  <div className={`finder-projects is-${view}`}>
                    {filtered.map((item) => (
                      <button
                        key={item.id}
                        className="finder-project"
                        onClick={() =>
                          navigate({ side: 'work', projectId: item.id })
                        }
                      >
                        <span className="project-mark" aria-hidden="true">
                          {item.name
                            .split(/\s+/)
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                        <span className="finder-project-copy">
                          <strong>{item.name}</strong>
                          <span>{item.description}</span>
                          <small>
                            {item.category} · {item.tags.join(' · ')}
                          </small>
                        </span>
                        <ArrowUpRight
                          className="finder-project-arrow"
                          size={17}
                        />
                      </button>
                    ))}
                  </div>
                  {!filtered.length && (
                    <p className="empty-state">
                      No projects match “{query}”. Try another name or
                      technology.
                    </p>
                  )}
                </>
              )}
            </>
          )}
          {location.side === 'about' && (
            <article>
              <img
                className="about-avatar"
                src={profile.avatar}
                alt={profile.name}
                crossOrigin="anonymous"
              />
              <h2>A little about me.</h2>
              <p className="finder-subtitle">
                {profile.role} · {profile.location}
              </p>
              <div className="about-copy">
                {locations.about.children
                  .find((item) => item.fileType === 'txt')
                  ?.description?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
              </div>
              <dl className="skills-list">
                <div>
                  <dt>Web</dt>
                  <dd>React, Next.js, TypeScript</dd>
                </div>
                <div>
                  <dt>Blockchain</dt>
                  <dd>Solana, Rust, Anchor</dd>
                </div>
              </dl>
              <button
                className="primary-action"
                onClick={() => open('contact')}
              >
                Get in touch <ArrowUpRight size={16} />
              </button>
            </article>
          )}
          {location.side === 'resume' && (
            <>
              <h2>Résumé</h2>
              <p className="finder-subtitle">
                View the PDF, or download a copy to read later.
              </p>
              <div className="file-grid">
                <button onClick={() => open('resume')}>
                  <img src="/images/pdf.png" alt="" />
                  <span>Résumé.pdf</span>
                </button>
              </div>
            </>
          )}
          {location.side === 'trash' && (
            <>
              <h2>Archive</h2>
              <p className="finder-subtitle">
                A few visual experiments kept around.
              </p>
              <div className="file-grid">
                {locations.trash.children.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      open('imgfile', {
                        name: item.name,
                        imageUrl: item.imageUrl,
                      })
                    }
                  >
                    <img src={item.icon} alt="" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="finder-status">
        {project ? project.name : locations[location.side].name}
        <span>Pratham’s MacFolio</span>
      </div>
    </div>
  )
}
const Finder = ({ windowData }: { windowData?: FinderData }) => (
  <FinderContent
    key={`${windowData?.activeSide ?? 'work'}-${windowData?.projectId ?? ''}`}
    initial={windowData}
  />
)
export default WindowWrapper(Finder, 'finder')
