import { useState } from 'react'
import { usePlayCoreAscii } from '../hooks/usePlayCoreAscii'
import { RendererElement } from './RendererElement'
import { PlaygroundSettings, PlaygroundProgram } from '../types/playground'

interface AsciiPlaygroundProps {
  program: PlaygroundProgram
  settings?: PlaygroundSettings
  userData?: unknown
  className?: string
}

export function AsciiPlayground({ 
  program, 
  settings = {}, 
  className = '' 
}: AsciiPlaygroundProps) {
  const [element, setElement] = useState<HTMLPreElement | HTMLCanvasElement | null>(null)
  usePlayCoreAscii(element, program)

  return (
    <div className={`ascii-playground ${className}`}>
      <RendererElement
        ref={(r) => setElement(r)}
        renderer={settings.renderer || 'text'}
      />
    </div>
  )
} 