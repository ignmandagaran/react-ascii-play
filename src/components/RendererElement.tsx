import { forwardRef } from 'react'
import { PlaygroundSettings } from '../types/playground'

interface RendererElementProps {
  renderer: 'text' | 'canvas'
  settings?: PlaygroundSettings
  className?: string
}

export const RendererElement = forwardRef<HTMLPreElement | HTMLCanvasElement, RendererElementProps>(
  ({ renderer, className = '' }, ref) => {
    const Element = renderer === 'canvas' ? 'canvas' : 'pre'

    return (
      <Element
        ref={ref}
        className={`renderer ${className}`}
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: '1rem',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      />
    )
  }
) 