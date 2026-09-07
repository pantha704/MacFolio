import { ArrowUpRight, Command, FolderOpen, Mail } from 'lucide-react'
import { useWindowStore } from '#store/useWindowStore'
import { profile, projects } from '../data/portfolio'

const Welcome = () => {
  const openWindow = useWindowStore(state => state.openWindow)
  return (
    <section className="desktop-content" id="portfolio" tabIndex={-1} aria-label="Portfolio overview">
      <div className="desktop-heading"><span>PERSONAL SPACE / {profile.firstName.toUpperCase()}</span><span>DESIGNED TO BE EXPLORED</span></div>
      <div className="desktop-intro">
        <div className="intro-copy">
          <p className="eyebrow">Developer. Builder. Curious by default.</p>
          <h1>Hi, I’m {profile.firstName}.<br /><em>Make yourself at home.</em></h1>
          <p className="intro-description">I build for the web and Solana. This is my little corner of the internet—part portfolio, part playground.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => openWindow('finder', { activeSide: 'work' })}><FolderOpen size={18} /> Explore my work</button>
            <button className="secondary-action" onClick={() => openWindow('contact')}><Mail size={18} /> Let’s talk</button>
          </div>
          <div className="intro-stack"><span>React</span><span>TypeScript</span><span>Rust</span><span>Solana</span></div>
        </div>
        <aside className="desktop-note" aria-label="About this space">
          <div className="note-header"><span className="note-mark">⌘</span><span>A NOTE FROM ME</span></div>
          <p>Good software should<br />feel <em>second nature.</em></p>
          <span className="note-description">That’s what I’m working toward.<br />One project at a time.</span>
          <button onClick={() => openWindow('finder', { activeSide: 'about' })}>A little about me <ArrowUpRight size={17} /></button>
        </aside>
      </div>
      <div className="work-heading"><h2>Selected work</h2><button onClick={() => openWindow('finder', { activeSide: 'work' })}>All {projects.length} projects <ArrowUpRight size={16} /></button></div>
      <div className="project-shortcuts">
        {projects.slice(0, 3).map((project, index) => (
          <button key={project.id} className="project-shortcut" onClick={() => openWindow('finder', { projectId: project.id })}>
            <span className="project-number">0{index + 1}</span>
            <img src="/images/folder.png" alt="" width={68} height={68} />
            <span className="project-shortcut-copy"><strong>{project.name}</strong><span>{project.category}</span></span>
            <ArrowUpRight size={20} className="project-arrow" />
          </button>
        ))}
      </div>
      <footer className="desktop-footer"><span>Built with curiosity. Based in {profile.location}.</span><span><Command size={14} /> K to find your way · Alt W to close a window</span></footer>
    </section>
  )
}
export default Welcome
