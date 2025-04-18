import { PlayCoreAsciiContext, PlayCoreAsciiBuffer, PlayCoreAsciiSettings } from '../types'

declare const textRenderer: {
  preferredElementNodeName: 'PRE'
  render: (context: PlayCoreAsciiContext, buffer: PlayCoreAsciiBuffer[], settings: PlayCoreAsciiSettings) => void
}

export default textRenderer 