import { Navbar, Welcome, Dock } from "#components";
import { Terminal, Safari, Finder, Gallery } from "#windows";
import { Draggable } from "gsap/Draggable"
import gsap from "gsap"

gsap.registerPlugin(Draggable)

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <Safari />
      <Finder />
      <Terminal />
      <Gallery />
    </main>
  )
}

export default App
