import { useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { ArrowLeft, ArrowRight, RotateCw, Search, Github } from 'lucide-react'
import GitHubProfile from '#components/apps/GitHubProfile'
import { resolveBrowserInput } from '../utils/browserUrl'
import { profile } from '../data/portfolio'

const Safari = () => {
  const [history, setHistory] = useState([''])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  const [refresh, setRefresh] = useState(0)
  const current = history[index]
  const navigate = (value: string) => {
    const result = resolveBrowserInput(value)
    if (!result) { setMessage('Enter a web address or search phrase.'); return }
    setMessage('')
    if (result.internal) { setHistory(previous => [...previous.slice(0, index + 1), result.url]); setIndex(index + 1); setInput(result.url) }
    else { const opened = window.open(result.url, '_blank', 'noopener,noreferrer'); void opened; setMessage('Requested a new tab. If it didn’t open, allow pop-ups for this site.') }
  }
  const go = (next: number) => { setIndex(next); setInput(history[next]); setMessage('') }
  return <div className="safari-app"><div className="window-header safari-toolbar"><WindowControls target="safari" /><div className="safari-history"><button aria-label="Back" disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft size={16} /></button><button aria-label="Forward" disabled={index === history.length - 1} onClick={() => go(index + 1)}><ArrowRight size={16} /></button></div><form onSubmit={event => { event.preventDefault(); navigate(input) }}><Search size={15} /><input aria-label="Search or enter website address" value={input} onChange={event => setInput(event.target.value)} placeholder="Search or enter a website" /><button aria-label="Go" type="submit"><ArrowRight size={16} /></button></form><button aria-label="Refresh GitHub profile" disabled={!current} onClick={() => setRefresh(value => value + 1)}><RotateCw size={16} /></button></div>{message && <p className="safari-message" role="status">{message}</p>}<div className="safari-content">{current ? <GitHubProfile key={refresh} /> : <div className="safari-start"><span className="eyebrow">A WINDOW TO THE WEB</span><h2>Follow your curiosity.</h2><p>Explore my GitHub profile here, or search the web in a new tab.</p><button className="secondary-action" onClick={() => navigate(profile.github)}><Github size={20} />pantha704 on GitHub</button></div>}</div></div>
}
export default WindowWrapper(Safari, 'safari')
