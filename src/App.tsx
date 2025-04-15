import { AsciiPlayground } from './components/AsciiPlayground'
import simpleOutput from './examples/simpleOutput'
import { PlaygroundSettings } from './types/playground'
import './css/font.css'
import './App.css'

const settings: PlaygroundSettings = {
  renderer: 'text',
  fps: 30,
  fontFamily: 'Simple Console, monospace',
  fontSize: '16px',
  color: '#fff',
}

function App() {
  return (
    <div className="app">
      <div className="playground-container">
        <AsciiPlayground 
          program={simpleOutput}
          settings={settings}
        />
      </div>
    </div>
  )
}

export default App
