export interface PlayCoreAsciiMetrics {
  cellWidth: number;
  lineHeight: number;
  fontFamily: string;
  fontSize: number;
  aspect: number;
}

export interface PlayCoreAsciiContext {
  frame: number;
  time: number;
  cols: number;
  rows: number;
  metrics: PlayCoreAsciiMetrics;
  width: number;
  height: number;
  settings: PlayCoreAsciiSettings;
  runtime: {
    cycle: number;
    fps: number;
  };
}

export interface PlayCoreAsciiCursor {
  x: number;
  y: number;
  pressed: boolean;
  p: {
    x: number;
    y: number;
    pressed: boolean;
  };
}

export interface PlayCoreAsciiCell {
  x: number;
  y: number;
  index: number;
}

export interface PlayCoreAsciiBuffer {
  char: string | number;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
}

export interface PlayCoreState {
  time: number;
  frame: number;
  cycle: number;
}

export type AnimationCallback = (time: number) => void;

export interface PlayCoreAsciiSettings {
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

export interface PlayCoreAsciiProgram {
  boot?: (
    context: PlayCoreAsciiContext,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void;
  pre?: (
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void;
  main?: (
    cell: PlayCoreAsciiCell,
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void | PlayCoreAsciiBuffer | string;
  post?: (
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>
  ) => void;
  pointerMove?: (
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: PointerEvent
  ) => void;
  pointerDown?: (
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: PointerEvent
  ) => void;
  pointerUp?: (
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: PointerEvent
  ) => void;
  keyDown?: (
    context: PlayCoreAsciiContext,
    cursor: PlayCoreAsciiCursor,
    buffer: PlayCoreAsciiBuffer[],
    userData?: Record<string, unknown>,
    eventData?: KeyboardEvent
  ) => void;
  settings?: PlayCoreAsciiSettings;
}