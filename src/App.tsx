import simpleOutput from './examples/simpleOutput'
import { PlaygroundSettings } from './types/playground'
import './css/font.css'
import './App.css'
import { PlayCoreAscii } from './components/PlayCoreAscii'

const settings: PlaygroundSettings = {
  renderer: 'canvas',
  fps: 30,
  fontFamily: 'Simple Console, monospace',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#000',
}

function App() {
  return (
    <div className="app">
      <div className="playground-container">
        <PlayCoreAscii 
          program={simpleOutput}
          settings={settings}
        />
      </div>
    </div>
  )
}

export default App
