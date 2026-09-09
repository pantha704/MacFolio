import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import NodeShell from '../components/NodeShell'

// Terminal is a real WebContainer shell, including node, npm and npx.
const Terminal = () => <div className="terminal-layout"><header className="window-header"><WindowControls target="terminal"/><span>Terminal</span></header><NodeShell/></div>
export default WindowWrapper(Terminal, 'terminal')
