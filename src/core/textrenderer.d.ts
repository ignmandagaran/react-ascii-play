import { PlaygroundContext, PlaygroundBuffer, PlaygroundSettings } from '../types/playground'

declare const textRenderer: {
  preferredElementNodeName: 'PRE'
  render: (context: PlaygroundContext, buffer: PlaygroundBuffer[], settings: PlaygroundSettings) => void
}

export default textRenderer 