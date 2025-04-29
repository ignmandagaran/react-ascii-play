import { AsciiRendererContext, AsciiBuffer, AsciiRendererSettings } from '../types'

declare const textRenderer: {
  preferredElementNodeName: 'PRE'
  render: (context: AsciiRendererContext, buffer: AsciiBuffer[], settings: AsciiRendererSettings) => void
}

export default textRenderer 