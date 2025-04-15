export interface PlaygroundMetrics {
  cellWidth: number;
  lineHeight: number;
  fontFamily: string;
  fontSize: number;
  aspect: number;
}

export interface PlaygroundContext {
  frame: number;
  time: number;
  cols: number;
  rows: number;
  metrics: PlaygroundMetrics;
  width: number;
  height: number;
  settings: PlaygroundSettings;
  runtime: {
    cycle: number;
    fps: number;
  };
}

export interface PlaygroundCursor {
  x: number;
  y: number;
  pressed: boolean;
  p: {
    x: number;
    y: number;
    pressed: boolean;
  };
}

export interface PlaygroundCell {
  x: number;
  y: number;
  index: number;
}

export interface PlaygroundBuffer {
  char: string;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
}

export interface PlaygroundSettings {
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
}

export interface PlaygroundProgram {
  boot?: (
    context: PlaygroundContext,
    buffer: PlaygroundBuffer[],
    userData?: unknown
  ) => void;
  pre?: (
    context: PlaygroundContext,
    cursor: PlaygroundCursor,
    buffer: PlaygroundBuffer[],
    userData?: unknown
  ) => void;
  main?: (
    cell: PlaygroundCell,
    context: PlaygroundContext,
    cursor: PlaygroundCursor,
    buffer: PlaygroundBuffer[],
    userData?: unknown
  ) => void | PlaygroundBuffer | string;
  post?: (
    context: PlaygroundContext,
    cursor: PlaygroundCursor,
    buffer: PlaygroundBuffer[],
    userData?: unknown
  ) => void;
  pointerMove?: (
    context: PlaygroundContext,
    cursor: PlaygroundCursor,
    buffer: PlaygroundBuffer[]
  ) => void;
  pointerDown?: (
    context: PlaygroundContext,
    cursor: PlaygroundCursor,
    buffer: PlaygroundBuffer[]
  ) => void;
  pointerUp?: (
    context: PlaygroundContext,
    cursor: PlaygroundCursor,
    buffer: PlaygroundBuffer[]
  ) => void;
  settings?: PlaygroundSettings;
}
