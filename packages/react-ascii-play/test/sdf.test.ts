import { describe, expect, test } from "bun:test";
import { sdBox, sdSegment } from "../src/modules/sdf.js";
import * as original from "./fixtures/sdf.original.js";

interface Vec2 {
  x: number;
  y: number;
}

const special = [
  0, -0, 1, -1, 0.5, 1e-300, -1e-300, 5e-324, 1e300, -1e300,
  Number.MAX_VALUE, Infinity, -Infinity, NaN, 0.1, 0.2, 0.30000000000000004,
];

function random(seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pick = () => {
    const r = rnd();
    if (r < 0.15) return special[Math.floor(rnd() * special.length)];
    if (r < 0.3) return (rnd() - 0.5) * 1e-8;
    if (r < 0.4) return (rnd() - 0.5) * 1e12;
    return (rnd() - 0.5) * 8;
  };
  return { pick, vec: (): Vec2 => ({ x: pick(), y: pick() }) };
}

// Object.is: distinguishes -0 from 0 and treats NaN as equal to NaN.
function mismatches(fn: "sdSegment" | "sdBox", calls: unknown[][]) {
  const out: unknown[] = [];
  for (const args of calls) {
    const a = (original[fn] as (...x: unknown[]) => number)(...args);
    const b = (fn === "sdSegment" ? sdSegment : sdBox) as (...x: unknown[]) => number;
    if (!Object.is(a, b(...args))) out.push(args);
    if (out.length >= 5) break;
  }
  return out;
}

describe("sdf functions match the original implementation bit for bit", () => {
  const edges: Vec2[] = special.flatMap((x) => special.map((y) => ({ x, y })));

  test("sdSegment edge cases: coincident endpoints, signed zero, non-finite", () => {
    const calls = edges.flatMap((p) => [
      [p, { x: 1, y: 1 }, { x: 1, y: 1 }, 0.1],
      [p, p, p, 0],
      [{ x: 0.3, y: -0.2 }, p, { x: -0, y: 0 }, -0],
      [{ x: 0, y: 0 }, { x: -1, y: 0 }, p, 0.05],
    ]);
    expect(mismatches("sdSegment", calls)).toEqual([]);
  });

  test("sdBox edge cases", () => {
    const calls = edges.flatMap((p) => [
      [p, { x: 0.5, y: 0.25 }],
      [{ x: 0.3, y: -0.7 }, p],
      [p, p],
    ]);
    expect(mismatches("sdBox", calls)).toEqual([]);
  });

  test("random inputs", () => {
    const r = random(42);
    const segment = Array.from({ length: 200_000 }, () => [r.vec(), r.vec(), r.vec(), r.pick()]);
    const box = Array.from({ length: 200_000 }, () => [r.vec(), r.vec()]);
    expect(mismatches("sdSegment", segment)).toEqual([]);
    expect(mismatches("sdBox", box)).toEqual([]);
  });
});
