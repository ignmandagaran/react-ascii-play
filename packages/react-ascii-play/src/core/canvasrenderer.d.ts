import { AsciiRendererContext, AsciiBuffer, AsciiRendererSettings } from '../types'

export interface CanvasRenderer {
  preferredElementNodeName: 'CANVAS'
  render: (context: AsciiRendererContext, buffer: AsciiBuffer[], settings: AsciiRendererSettings) => void
  dispose: () => void
}

export declare function createCanvasRenderer(): CanvasRenderer
