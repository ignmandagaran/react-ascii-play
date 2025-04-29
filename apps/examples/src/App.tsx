import { AsciiRendererSettings, ReactAsciiPlay } from "react-ascii-play";
import "./css/font.css";
import "./App.css";
import torusProgram from "./examples/torus";

const settings: AsciiRendererSettings = {
  renderer: "canvas",
  fps: 60,
  fontFamily: "Simple Console, monospace",
};

function App() {
  return (
    <div className="app">
      <div className="playground-container">
        <ReactAsciiPlay
          className="simple-console-font"
          program={torusProgram}
          settings={settings}
        />
      </div>
    </div>
  );
}

export default App;
