import { useWindowStore } from '#store/useWindowStore'

const WindowControls = ({target}: {target: any}) => {
  const { closeWindow } = useWindowStore()

  return (
    <div id="window-controls">
      <div className='close' onClick={() => closeWindow(target)}/>
      <div className='minimize'/>
      <div className='maximize'/>
    </div>
  )
}

export default WindowControls
