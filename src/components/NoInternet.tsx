import { WifiOff } from 'lucide-react'
import { useSystemStore } from '#store/systemStore'
const NoInternet = () => <section className="simulated-offline" id="portfolio" tabIndex={-1}><WifiOff size={36} /><h1>You switched off the desktop Wi-Fi.</h1><p>Just a little desktop simulation. Your actual internet connection hasn’t changed.</p><button className="primary-action" onClick={() => useSystemStore.getState().setWifi(true)}>Back to my portfolio</button></section>
export default NoInternet
