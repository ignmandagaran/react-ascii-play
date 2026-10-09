// A canvas whose 2D context records what would end up on screen, in device
// pixels, instead of rasterizing. Two renderers draw the same picture when
// their normalized op lists are equal. It models the context state that
// affects output: fill style (invalid colors are ignored, as in browsers),
// font, text baseline, the transform, save/restore, and the reset that
// happens when width or height is assigned.

export interface DrawOp {
  op: "clear" | "fillRect" | "clearRect" | "fillText";
  [key: string]: unknown;
}

type Matrix = [number, number, number, number, number, number];

interface State {
  fillStyle: string;
  font: string;
  textBaseline: string;
  transform: Matrix;
}

const NAMED_COLORS = new Set([
  "black", "white", "red", "green", "blue", "navy", "royalblue",
  "transparent", "gray", "yellow",
]);

function isValidColor(value: string) {
  return (
    NAMED_COLORS.has(value.toLowerCase()) ||
    /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ||
    /^rgba?\([^)]*\)$/i.test(value)
  );
}

const defaultState = (): State => ({
  fillStyle: "#000000",
  font: "10px sans-serif",
  textBaseline: "alphabetic",
  transform: [1, 0, 0, 1, 0, 0],
});

export interface RecordingCanvas {
  canvas: HTMLCanvasElement;
  ops: DrawOp[];
  /** Number of width/height assignments. */
  sizeWrites: number;
  /** Width returned by measureText per character; change it to simulate a font load. */
  glyphWidth: number;
}

export function createRecordingCanvas(): RecordingCanvas {
  const canvas = document.createElement("canvas");
  const rec: RecordingCanvas = { canvas, ops: [], sizeWrites: 0, glyphWidth: 9 };
  let width = 300;
  let height = 150;
  let state = defaultState();
  let stack: State[] = [];

  const reset = () => {
    state = defaultState();
    stack = [];
    rec.ops.push({ op: "clear" });
  };

  Object.defineProperty(canvas, "width", {
    configurable: true,
    get: () => width,
    set: (v: number) => {
      rec.sizeWrites++;
      width = Math.max(0, Math.trunc(v)) || 0;
      reset();
    },
  });
  Object.defineProperty(canvas, "height", {
    configurable: true,
    get: () => height,
    set: (v: number) => {
      rec.sizeWrites++;
      height = Math.max(0, Math.trunc(v)) || 0;
      reset();
    },
  });

  const apply = (x: number, y: number) => {
    const [a, b, c, d, e, f] = state.transform;
    return [a * x + c * y + e, b * x + d * y + f];
  };
  const isIdentity = () => state.transform.join() === "1,0,0,1,0,0";

  const ctx = {
    get fillStyle() {
      return state.fillStyle;
    },
    set fillStyle(v: string) {
      if (typeof v === "string" && isValidColor(v)) state.fillStyle = v;
    },
    get font() {
      return state.font;
    },
    set font(v: string) {
      state.font = v;
    },
    get textBaseline() {
      return state.textBaseline;
    },
    set textBaseline(v: string) {
      state.textBaseline = v;
    },
    save() {
      stack.push({ ...state, transform: [...state.transform] as Matrix });
    },
    restore() {
      const s = stack.pop();
      if (s) state = s;
    },
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
      state.transform = [a, b, c, d, e, f];
    },
    scale(x: number, y: number) {
      const [a, b, c, d, e, f] = state.transform;
      state.transform = [a * x, b * x, c * y, d * y, e, f];
    },
    translate(x: number, y: number) {
      const [a, b, c, d, e, f] = state.transform;
      state.transform = [a, b, c, d, a * x + c * y + e, b * x + d * y + f];
    },
    clearRect(x: number, y: number, w: number, h: number) {
      if (isIdentity() && x <= 0 && y <= 0 && x + w >= width && y + h >= height) {
        rec.ops.push({ op: "clear" });
      } else {
        const [dx, dy] = apply(x, y);
        rec.ops.push({ op: "clearRect", x: dx, y: dy, w, h, transform: state.transform.join() });
      }
    },
    fillRect(x: number, y: number, w: number, h: number) {
      const [dx, dy] = apply(x, y);
      rec.ops.push({ op: "fillRect", x: dx, y: dy, w, h, style: state.fillStyle, transform: state.transform.join() });
    },
    fillText(text: unknown, x: number, y: number) {
      const s = String(text);
      // Whitespace has no ink.
      if (s === " " || s === "") return;
      const [dx, dy] = apply(x, y);
      rec.ops.push({
        op: "fillText", text: s, x: dx, y: dy,
        style: state.fillStyle, font: state.font, baseline: state.textBaseline,
        transform: state.transform.join(),
      });
    },
    measureText(text: unknown) {
      return { width: String(text).length * rec.glyphWidth };
    },
  };

  (canvas as unknown as { getContext: (type: string) => unknown }).getContext = (type: string) =>
    type === "2d" ? ctx : null;

  return rec;
}

/**
 * First position where two normalized op lists differ, or null when equal.
 * Asserting on this keeps failures readable (and fast) for large frames.
 */
export function firstDifference(actual: DrawOp[], expected: DrawOp[]) {
  const a = normalizeOps(actual);
  const e = normalizeOps(expected);
  const n = Math.max(a.length, e.length);
  for (let i = 0; i < n; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(e[i])) {
      return { index: i, actual: a[i] ?? null, expected: e[i] ?? null, lengths: [a.length, e.length] };
    }
  }
  return null;
}

/** Drops repeated clears: several resets in a row leave the same empty canvas. */
export function normalizeOps(ops: DrawOp[]): DrawOp[] {
  const out: DrawOp[] = [];
  for (const op of ops) {
    if (op.op === "clear" && out.at(-1)?.op === "clear") continue;
    out.push(op);
  }
  return out;
}
