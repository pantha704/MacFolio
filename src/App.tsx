import { Navbar, Welcome, Dock, NoInternet } from "#components";
import { Terminal, Safari, Finder, Gallery } from "#windows";
import { Draggable } from "gsap/Draggable"
import gsap from "gsap"
import { useSystemStore } from "./store/systemStore"

gsap.registerPlugin(Draggable)

const App = () => {
  const { isWifiEnabled } = useSystemStore()

  return (
    <main>
      <Navbar />
      {isWifiEnabled ? (
        <>
            <Welcome />
            <Dock />

            <Safari />
            <Finder />
            <Terminal />
            <Gallery />
        </>
      ) : (
        <NoInternet />
      )}
    </main>
  )
}

export default App
