import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import TerminalBox from '#components/TerminalBox'

const Terminal = () => {
  return (
    <>
     <div className="window-header">
      <WindowControls target="terminal"/>
      <h2>Terminal</h2>
     </div>
     <div className="h-[calc(100%-2.5rem)] w-full">
       <TerminalBox />
     </div>
    </>
  )
}

const TerminalWindow = WindowWrapper(Terminal, 'terminal')

export default TerminalWindow
