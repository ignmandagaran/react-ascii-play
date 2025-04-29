import { AsciiRendererContext, AsciiBuffer, AsciiRendererSettings } from '../types'

declare const canvasRenderer: {
  preferredElementNodeName: 'CANVAS'
  render: (context: AsciiRendererContext, buffer: AsciiBuffer[], settings: AsciiRendererSettings) => void
}

export default canvasRenderer 