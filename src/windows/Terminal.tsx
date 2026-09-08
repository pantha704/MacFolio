import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import TerminalBox from '#components/TerminalBox'
import { WebContainerProvider } from '#context/WebContainerContext'
const Terminal = () => <div className="terminal-layout"><div className="window-header flex items-center gap-5"><WindowControls target="terminal" /><span>Terminal</span></div><div className="terminal-content"><WebContainerProvider><TerminalBox /></WebContainerProvider></div></div>
export default WindowWrapper(Terminal, 'terminal')
