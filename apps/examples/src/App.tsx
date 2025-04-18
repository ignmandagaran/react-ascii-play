import { PlayCoreAsciiSettings } from "./types";
import "./css/font.css";
import "./App.css";
import { PlayCoreAscii } from "./components/PlayCoreAscii";
import torusProgram from "./examples/torus";

const settings: PlayCoreAsciiSettings = {
  renderer: "canvas",
  fps: 60,
  fontFamily: "Simple Console, monospace",
};

function App() {
  return (
    <div className="app">
      <div className="playground-container">
        <PlayCoreAscii
          className="simple-console-font"
          program={torusProgram}
          settings={settings}
        />
      </div>
    </div>
  );
}

export default App;
