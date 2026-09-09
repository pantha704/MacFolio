import { useState } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { ArrowUpRight, Copy, Mail } from 'lucide-react'
import { profile } from '../data/portfolio'

const Contact = () => {
  const [status, setStatus] = useState('')
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setStatus('Email address copied.') }
    catch { setStatus('Automatic copy is unavailable. The email field is selected for you.') ; requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.contact-email input')?.select()) }
  }
  return <div className="contact-app"><div className="window-header flex items-center gap-5"><WindowControls target="contact" /><span>Get in touch</span></div><div className="contact-content"><img src={profile.avatar} alt={profile.name} crossOrigin="anonymous" width={76} height={76} /><span className="eyebrow">LET’S MAKE SOMETHING GOOD</span><h2>Great things start<br />with a conversation.</h2><p>Have a project in mind, a question, or something interesting to share? I’d love to hear about it.</p><div className="contact-email"><input aria-label="Email address" readOnly value={profile.email} onFocus={event => event.currentTarget.select()} /><button onClick={copy} aria-label="Copy email address"><Copy size={14} />Copy</button></div><div className="copy-status" role="status">{status}</div><a className="primary-action" href={`mailto:${profile.email}`}><Mail size={17} />Say hello</a><div className="contact-socials"><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={16} /></a><a href={profile.twitter} target="_blank" rel="noopener noreferrer">Twitter / X<ArrowUpRight size={16} /></a></div></div></div>
}
export default WindowWrapper(Contact, 'contact')
