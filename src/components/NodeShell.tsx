import TerminalBox from './TerminalBox'
import { WebContainerProvider } from '../context/WebContainerContext'
export default function NodeShell() { return <div className="terminal-content"><WebContainerProvider><TerminalBox/></WebContainerProvider></div> }
