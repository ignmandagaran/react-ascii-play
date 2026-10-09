import { describe, expect, test } from "bun:test";
import { createFrameCap } from "../src/core/framecap";

// rAF timestamps at `hz` for `seconds`, with optional jitter and ms rounding
// (some browsers coarsen timestamps).
function timestamps(hz: number, seconds: number, jitter: number, round: boolean) {
  let s = 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const period = 1000 / hz;
  const out: number[] = [];
  for (let k = 1; k <= hz * seconds; k++) {
    let t = k * period + (rnd() * 2 - 1) * jitter;
    if (round) t = Math.round(t);
    out.push(t);
  }
  return out;
}

function renderRate(fps: number, ts: number[]) {
  const cap = createFrameCap(fps);
  let n = 0;
  for (const t of ts) if (cap.shouldRender(t)) n++;
  return n / ((ts[ts.length - 1] - ts[0]) / 1000);
}

describe("frame cap", () => {
  for (const hz of [60, 120, 144, 240]) {
    for (const fps of [30, 60, 120]) {
      test(`${hz} Hz display, fps ${fps}: renders at min(hz, fps) under jitter`, () => {
        const expected = Math.min(hz, fps);
        for (const [jitter, round] of [[0, false], [0.3, false], [0, true], [0.5, true]] as const) {
          const rate = renderRate(fps, timestamps(hz, 10, jitter, round));
          expect(Math.abs(rate - expected)).toBeLessThan(0.5);
        }
      });
    }
  }

  test("does not burst after a stall", () => {
    const cap = createFrameCap(60);
    for (let k = 1; k <= 120; k++) cap.shouldRender(k * 8.333);
    let rendered = 0;
    for (let k = 0; k < 24; k++) if (cap.shouldRender(3000 + k * 8.333)) rendered++;
    // 200 ms at 60 fps
    expect(rendered).toBe(12);
  });

  test("renders the first frame and the first frame after reset", () => {
    const cap = createFrameCap(30);
    expect(cap.shouldRender(5)).toBe(true);
    expect(cap.shouldRender(10)).toBe(false);
    cap.reset();
    expect(cap.shouldRender(11)).toBe(true);
  });
});
