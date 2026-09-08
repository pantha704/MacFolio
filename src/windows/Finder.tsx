import { useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { locations } from '#constants'
import { useWindowStore } from '#store/useWindowStore'
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react'
import { profile, projects } from '../data/portfolio'

type Side = keyof typeof locations
type FinderData = { activeSide?: Side; projectId?: number }
const FinderContent = ({ initial }: { initial?: FinderData }) => {
  const [side, setSide] = useState<Side>(initial?.activeSide ?? 'work')
  const [selected, setSelected] = useState<number | null>(initial?.projectId ?? null)
  const [query, setQuery] = useState('')
  const open = useWindowStore(state => state.openWindow)
  const project = projects.find(item => item.id === selected)
  const filtered = projects.filter(item => `${item.name} ${item.category} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="finder-app">
    <div className="window-header flex items-center gap-5"><WindowControls target="finder" /><span>{project?.name ?? locations[side].name}</span></div>
    <div className="finder-layout">
      <aside className="finder-sidebar" aria-label="Finder folders"><p className="sidebar-label">Favorites</p>{Object.entries(locations).map(([key, location]) => <button key={key} title={location.name} aria-label={location.name} aria-current={side === key ? 'page' : undefined} onClick={() => { setSide(key as Side); setSelected(null); setQuery('') }}><img src={location.icon} alt="" /><span>{location.name}</span></button>)}</aside>
      <div className="finder-main">
        {side === 'work' && <>
          <div className="finder-toolbar">{project && <button onClick={() => setSelected(null)} aria-label="Back to projects"><ArrowLeft size={18} /></button>}<Search size={18} aria-hidden="true" /><input aria-label="Filter projects" placeholder="Find a project or technology…" value={query} onChange={event => { setQuery(event.target.value); setSelected(null) }} /></div>
          {project ? <article className="project-detail"><span className="project-category">{project.category}</span><h2>{project.name}</h2><p>{project.description}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="project-links">{project.links.map((link, index) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={index === 0 ? 'primary-action' : 'secondary-action'}>{link.label}<ArrowUpRight size={16} /></a>)}</div></article> : <><h2>Things I’ve built.</h2><p className="finder-subtitle">From interactive web experiences to experiments on Solana.</p><div className="finder-projects">{filtered.map(item => <button key={item.id} className="finder-project" onClick={() => setSelected(item.id)}><img src="/images/folder.png" alt="" width={48} height={48} /><strong>{item.name}</strong><span>{item.description}</span><span>{item.tags.join(' · ')}</span></button>)}</div>{!filtered.length && <p className="empty-state">No projects match “{query}”. Try a different name or technology.</p>}</>}
        </>}
        {side === 'about' && <article><img className="about-avatar" src={profile.avatar} alt={profile.name} crossOrigin="anonymous" /><h2>A little about me.</h2><p className="finder-subtitle">{profile.role} · {profile.location}</p><div className="about-copy">{locations.about.children.find(item => item.fileType === 'txt')?.description?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><dl className="skills-list"><div><dt>Web</dt><dd>React, Next.js, TypeScript</dd></div><div><dt>Blockchain</dt><dd>Solana, Rust, Anchor</dd></div></dl><button className="primary-action" onClick={() => open('contact')}>Get in touch <ArrowUpRight size={16} /></button></article>}
        {side === 'resume' && <><h2>Résumé</h2><p className="finder-subtitle">View the PDF, or download a copy to read later.</p><div className="file-grid"><button onClick={() => open('resume')}><img src="/images/pdf.png" alt="" /><span>Résumé.pdf</span></button></div></>}
        {side === 'trash' && <><h2>Archive</h2><p className="finder-subtitle">A few things kept around.</p><div className="file-grid">{locations.trash.children.map(item => <button key={item.id} onClick={() => open('imgfile', { name: item.name, imageUrl: item.imageUrl })}><img src={item.icon} alt="" /><span>{item.name}</span></button>)}</div></>}
      </div>
    </div>
    <div className="finder-status">{side === 'work' ? `${filtered.length} projects` : locations[side].name} <span aria-hidden="true"> · </span> Pratham’s MacFolio</div>
  </div>
}
const Finder = ({ windowData }: { windowData?: FinderData }) => <FinderContent key={`${windowData?.activeSide ?? 'work'}-${windowData?.projectId ?? ''}`} initial={windowData} />
export default WindowWrapper(Finder, 'finder')
