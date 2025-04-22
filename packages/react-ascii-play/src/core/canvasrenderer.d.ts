import { PlayCoreAsciiContext, PlayCoreAsciiBuffer, PlayCoreAsciiSettings } from '../types'

declare const canvasRenderer: {
  preferredElementNodeName: 'CANVAS'
  render: (context: PlayCoreAsciiContext, buffer: PlayCoreAsciiBuffer[], settings: PlayCoreAsciiSettings) => void
}

export default canvasRenderer 