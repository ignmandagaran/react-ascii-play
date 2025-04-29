export interface AsciiMetrics {
  cellWidth: number;
  lineHeight: number;
  fontFamily: string;
  fontSize: number;
  aspect: number;
}

export interface AsciiRendererContext {
  frame: number;
  time: number;
  cols: number;
  rows: number;
  metrics: AsciiMetrics;
  width: number;
  height: number;
  settings: AsciiRendererSettings;
  runtime: {
    cycle: number;
    fps: number;
  };
}

export interface AsciiRendererCursor {
  x: number;
  y: number;
  pressed: boolean;
  p: {
    x: number;
    y: number;
    pressed: boolean;
  };
}

export interface AsciiCell {
  x: number;
  y: number;
  index: number;
}

export interface AsciiBuffer {
  char: string | number;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
}

export interface ProgramState {
  time: number;
  frame: number;
  cycle: number;
}

export type AnimationCallback = (time: number) => void;

export interface AsciiRendererSettings {
  cols?: number;
  rows?: number;
  fps?: number;
  renderer?: "text" | "canvas";
  allowSelect?: boolean;
  backgroundColor?: string;
  once?: boolean;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  lineHeight?: string;
  textAlign?: "left" | "center" | "right";
  intersection?: {
    threshold?: number;
    root?: HTMLElement;
    rootMargin?: string;
  };
}

export interface AsciiRendererProgram {
  boot?: (
    context: AsciiRendererContext,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void;
  pre?: (
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void;
  main?: (
    cell: AsciiCell,
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void | AsciiBuffer | string;
  post?: (
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void;
  pointerMove?: (
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: PointerEvent
  ) => void;
  pointerDown?: (
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: PointerEvent
  ) => void;
  pointerUp?: (
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: PointerEvent
  ) => void;
  keyDown?: (
    context: AsciiRendererContext,
    cursor: AsciiRendererCursor,
    buffer: AsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: KeyboardEvent
  ) => void;
}
