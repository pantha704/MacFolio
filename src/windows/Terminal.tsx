import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'
import { profile, projects } from '../data/portfolio'
const NodeShell = lazy(() => import('../components/NodeShell'))
const appNames: Record<string, WindowKey> = { finder:'finder', photos:'photos', contact:'contact', resume:'resume', settings:'settings', arcade:'arcade', safari:'safari' }
const Terminal = () => {
 const [lines,setLines] = useState(['MacFolio command desk. Type help to explore.', 'These portfolio commands run locally. Use Node shell for a full runtime.'])
 const [value,setValue] = useState(''), [history,setHistory] = useState<string[]>([]), [cursor,setCursor] = useState(0), [shell,setShell] = useState(false)
 const bottom = useRef<HTMLDivElement>(null)
 useEffect(() => { bottom.current?.scrollIntoView({block:'nearest'}) }, [lines])
 function run() { const text = value.trim(); if (!text) return; const [cmd,...args] = text.split(/\s+/); let output = ''; setHistory(h => [...h,text]); setCursor(history.length+1); setValue('');
 switch(cmd.toLowerCase()) { case 'help': output='help · about · projects · open <app> · contact · date · clear\nApps: '+Object.keys(appNames).join(', '); break; case 'about': case 'whoami': output=profile.name+' — '+profile.role; break; case 'projects': case 'ls': output=projects.map(p => p.name+' — '+p.links[0].href).join('\n'); break; case 'contact': output=profile.email; break; case 'date': output=new Date().toLocaleString(); break; case 'clear': setLines([]); return; case 'open': if (appNames[args[0]]) { useWindowStore.getState().openWindow(appNames[args[0]]); output='Opened '+args[0] } else output='Choose an app: '+Object.keys(appNames).join(', '); break; default: output=`Command not found: ${cmd}. Type help.` }
 setLines(l => [...l.slice(-200), '❯ '+text, output]) }
 return <div className="terminal-layout"><header className="window-header"><WindowControls target="terminal"/><span>Terminal</span><button className="shell-switch" onClick={() => setShell(s => !s)}>{shell ? 'Portfolio commands' : 'Start Node shell'}</button></header>{shell ? <Suspense fallback={<p>Loading shell… <button onClick={() => setShell(false)}>Back</button></p>}><NodeShell/></Suspense> : <div className="command-terminal"><div role="log" aria-live="polite">{lines.map((line,i) => <pre key={i}>{line}</pre>)}</div><form onSubmit={e => {e.preventDefault();run()}}><span aria-hidden="true">❯</span><input aria-label="Terminal command" autoComplete="off" autoCapitalize="off" spellCheck={false} value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => {if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){e.preventDefault(); const next=Math.max(0,Math.min(history.length,cursor+(e.key==='ArrowUp'?-1:1)));setCursor(next);setValue(history[next]??'')} if(e.ctrlKey && e.key==='l'){e.preventDefault();setLines([])}}}/><button type="submit">Run</button></form><div ref={bottom}/></div>}</div>
}
export default WindowWrapper(Terminal, 'terminal')
