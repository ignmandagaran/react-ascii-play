import { PlaygroundContext, PlaygroundBuffer, PlaygroundSettings } from '../types/playground'

declare const canvasRenderer: {
  preferredElementNodeName: 'CANVAS'
  render: (context: PlaygroundContext, buffer: PlaygroundBuffer[], settings: PlaygroundSettings) => void
}

export default canvasRenderer 