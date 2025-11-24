import { Navbar, Welcome, Dock } from "#components";
import WindowManager from "#windows/WindowManager";

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <WindowManager />
      <Dock />
    </main>
  )
}

export default App
