import { PlaygroundContext, PlaygroundBuffer, PlaygroundSettings } from '../types'

declare const canvasRenderer: {
  preferredElementNodeName: 'CANVAS'
  render: (context: PlaygroundContext, buffer: PlaygroundBuffer[], settings: PlaygroundSettings) => void
}

export default canvasRenderer 