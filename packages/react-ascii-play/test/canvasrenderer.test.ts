import { afterEach, describe, expect, test } from "bun:test";
import { createCanvasRenderer } from "../src/core/canvasrenderer.js";
import originalRenderer from "./fixtures/canvasrenderer.original.js";
import { createRecordingCanvas, firstDifference, type RecordingCanvas } from "./helpers/recording-canvas";
import type { AsciiBuffer, AsciiRendererContext, AsciiRendererSettings } from "../src/types";

const metrics = { cellWidth: 9.6, lineHeight: 19.2, fontSize: 16, fontFamily: "monospace", aspect: 0.5 };

function setDevicePixelRatio(value: number) {
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => value });
}

afterEach(() => setDevicePixelRatio(1));

function makeContext(rec: RecordingCanvas, settings: Record<string, unknown>, width: number, height: number): AsciiRendererContext {
  return {
    frame: 0,
    time: 0,
    cols: Math.floor(width / metrics.cellWidth),
    rows: Math.floor(height / metrics.lineHeight),
    metrics,
    width,
    height,
    settings: { ...settings, element: rec.canvas } as AsciiRendererSettings,
    runtime: { cycle: 0, fps: 60 },
  };
}

// Deterministic buffer covering the cases the renderer special-cases:
// whitespace, empty and numeric chars, invalid and missing colors, backgrounds.
function makeBuffer(length: number, seed: number): AsciiBuffer[] {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const chars = [" ", " ", " ", "a", "X", "─", "", "Ж", 7];
  const colors = ["black", "royalblue", undefined, "not-a-color", "#0f0", "rgba(1,2,3,0.5)"];
  const backgrounds = [undefined, undefined, undefined, "navy", "rgba(255,0,0,0.4)", "white"];
  return Array.from({ length }, () => ({
    char: chars[Math.floor(rnd() * chars.length)] as string,
    color: colors[Math.floor(rnd() * colors.length)],
    backgroundColor: backgrounds[Math.floor(rnd() * backgrounds.length)],
  }));
}

interface Case {
  name: string;
  settings?: Record<string, unknown>;
  dpr?: number;
  width?: number;
  height?: number;
  frames?: number;
}

const cases: Case[] = [
  { name: "default" },
  { name: "opaque settings colors", settings: { backgroundColor: "black", color: "white", fontWeight: "700" } },
  { name: "translucent background over frames", settings: { backgroundColor: "rgba(0,128,255,0.3)" }, frames: 5 },
  { name: "transparent background", settings: { backgroundColor: "transparent" } },
  { name: "canvasSize + auto offset", settings: { canvasSize: { width: 320, height: 200 }, canvasOffset: { x: "auto", y: "auto" } } },
  { name: "numeric offset", settings: { canvasOffset: { x: 13.6, y: 7.2 } } },
  { name: "centered text", settings: { textAlign: "center" } },
  { name: "centered text with background", settings: { textAlign: "center", backgroundColor: "rgba(10,10,10,0.5)" } },
  { name: "device pixel ratio 2", dpr: 2 },
  { name: "fractional size at dpr 1.5", dpr: 1.5, width: 401.7, height: 203.3 },
];

describe("lean canvas renderer draws the same as the original", () => {
  for (const c of cases) {
    test(c.name, () => {
      setDevicePixelRatio(c.dpr ?? 1);
      const width = c.width ?? 300.5;
      const height = c.height ?? 200;
      const a = createRecordingCanvas();
      const b = createRecordingCanvas();
      const renderer = createCanvasRenderer();
      for (let f = 0; f < (c.frames ?? 3); f++) {
        const ctxA = makeContext(a, c.settings ?? {}, width, height);
        const ctxB = makeContext(b, c.settings ?? {}, width, height);
        const buffer = makeBuffer(ctxA.cols * ctxA.rows, 1 + f);
        a.ops.length = 0;
        b.ops.length = 0;
        originalRenderer.render(ctxA, buffer, ctxA.settings);
        renderer.render(ctxB, buffer, ctxB.settings);
        expect(firstDifference(b.ops, a.ops)).toBeNull();
        expect(b.canvas.style.width).toBe(a.canvas.style.width);
        expect(b.canvas.style.height).toBe(a.canvas.style.height);
      }
      renderer.dispose();
    });
  }
});

describe("lean canvas renderer state", () => {
  test("assigns the canvas size once while it doesn't change, even when fractional", () => {
    setDevicePixelRatio(1.5);
    const rec = createRecordingCanvas();
    const renderer = createCanvasRenderer();
    for (let f = 0; f < 10; f++) {
      const ctx = makeContext(rec, {}, 401.7, 203.3);
      renderer.render(ctx, makeBuffer(ctx.cols * ctx.rows, f + 1), ctx.settings);
    }
    expect(rec.sizeWrites).toBe(2);
    renderer.dispose();
  });

  test("re-measures centered glyphs after a web font finishes loading", () => {
    const a = createRecordingCanvas();
    const b = createRecordingCanvas();
    const renderer = createCanvasRenderer();
    const settings = { textAlign: "center" };
    const render = () => {
      const ctxA = makeContext(a, settings, 300, 100);
      const ctxB = makeContext(b, settings, 300, 100);
      const buffer = makeBuffer(ctxA.cols * ctxA.rows, 3);
      a.ops.length = 0;
      b.ops.length = 0;
      originalRenderer.render(ctxA, buffer, ctxA.settings);
      renderer.render(ctxB, buffer, ctxB.settings);
    };

    render();
    a.glyphWidth = b.glyphWidth = 11;
    document.fonts.dispatchEvent(new Event("loadingdone"));
    render();
    expect(firstDifference(b.ops, a.ops)).toBeNull();
    renderer.dispose();
  });

  test("keeps stale widths without the font event (proves the test above is sensitive)", () => {
    const a = createRecordingCanvas();
    const b = createRecordingCanvas();
    const renderer = createCanvasRenderer();
    const settings = { textAlign: "center" };
    const render = () => {
      const ctxA = makeContext(a, settings, 300, 100);
      const ctxB = makeContext(b, settings, 300, 100);
      const buffer = makeBuffer(ctxA.cols * ctxA.rows, 3);
      a.ops.length = 0;
      b.ops.length = 0;
      originalRenderer.render(ctxA, buffer, ctxA.settings);
      renderer.render(ctxB, buffer, ctxB.settings);
    };

    render();
    a.glyphWidth = b.glyphWidth = 11;
    render();
    expect(firstDifference(b.ops, a.ops)).not.toBeNull();
    renderer.dispose();
  });
});
