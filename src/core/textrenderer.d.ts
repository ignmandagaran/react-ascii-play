import { PlaygroundContext, PlaygroundBuffer, PlaygroundSettings } from '../types'

declare const textRenderer: {
  preferredElementNodeName: 'PRE'
  render: (context: PlaygroundContext, buffer: PlaygroundBuffer[], settings: PlaygroundSettings) => void
}

export default textRenderer 