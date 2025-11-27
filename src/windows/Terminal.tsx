import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import TerminalBox from '#components/TerminalBox'

const Terminal = () => {
  return (
    <>
     <div className="window-header bg-transparent! border-none!">
      <WindowControls target="terminal"/>
      <h2 className="text-gray-500">Terminal</h2>
     </div>
     <div className="h-[calc(100%-2.5rem)] w-full">
       <TerminalBox />
     </div>
    </>
  )
}

const TerminalWindow = WindowWrapper(Terminal, 'terminal')

export default TerminalWindow
