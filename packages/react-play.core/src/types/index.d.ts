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
}
export interface PlayCoreAsciiProgram {
    boot?: (context: PlayCoreAsciiContext, buffer: PlayCoreAsciiBuffer[], userData?: unknown) => void;
    pre?: (context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, buffer: PlayCoreAsciiBuffer[], userData?: unknown) => void;
    main?: (cell: PlayCoreAsciiCell, context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, buffer: PlayCoreAsciiBuffer[], userData?: unknown) => void | PlayCoreAsciiBuffer | string;
    post?: (context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, buffer: PlayCoreAsciiBuffer[], userData?: unknown) => void;
    pointerMove?: (context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, buffer: PlayCoreAsciiBuffer[]) => void;
    pointerDown?: (context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, buffer: PlayCoreAsciiBuffer[]) => void;
    pointerUp?: (context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, buffer: PlayCoreAsciiBuffer[]) => void;
    settings?: PlayCoreAsciiSettings;
}
