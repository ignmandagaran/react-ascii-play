import { AsciiRendererContext, AsciiBuffer, AsciiRendererSettings } from '../types'

export interface TextRenderer {
  preferredElementNodeName: 'PRE'
  render: (context: AsciiRendererContext, buffer: AsciiBuffer[], settings: AsciiRendererSettings) => void
  dispose: () => void
}

export declare function createTextRenderer(): TextRenderer
