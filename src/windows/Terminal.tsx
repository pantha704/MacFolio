import { useState, useEffect } from 'react'
import { useWindowStore } from '#store/useWindowStore'
import WindowWrapper from '#hoc/WindowWrapper'
import { techStack } from '#constants'
import { Check, Flag } from 'lucide-react'
import WindowControls from '#components/WindowControls'

const Terminal = () => {
  const { windows } = useWindowStore()
  const [renderTime, setRenderTime] = useState(() => Math.floor(Math.random() * 9) + 2)

  useEffect(() => {
    if (windows.terminal.isOpen) {
      const timeout = setTimeout(() => {
        setRenderTime(Math.floor(Math.random() * 9) + 2)
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [windows.terminal.isOpen])

  return (
    <>
     <div id="window-header">
      <WindowControls target="terminal"/>
      <h2>Tech Stack</h2>
     </div>

     <div className='techstack'>
      <p>
        <span className='font-bold text-[#00a154]'>~$ </span>
        stackfetch
      </p>

      <div className='label'>
        <p className='w-32'>Category</p>
        <p>Technology</p>
      </div>

      <ul className='content'>
        {techStack.map(({category, items}) => (
          <li key={category} className='flex items-center'>
            <Check className="check" size={20} />
            <h3>{category}</h3>
            <ul>
              {items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className='footnote'>
        <p>
          <Check size={20} />
          5 of 5 stacks loaded successfully (100%)
        </p>
        <p className='text-black'>
          <Flag size={15} />
          Render time: {renderTime}ms
        </p>
      </div>
     </div>
    </>
  )
}

const TerminalWindow = WindowWrapper(Terminal, 'terminal')

export default TerminalWindow
