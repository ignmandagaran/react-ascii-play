import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { getBuffer, mergeBuffer, setBuffer, setRectBuffer } from "../src/modules/buffer.js";
import { drawBox } from "../src/modules/drawbox.js";
import { exportFrame } from "../src/modules/exportframe.js";
import { saveSourceAsFile } from "../src/modules/filedownload.js";
import { createVec3, distSqVec3, distVec3 } from "../src/modules/vec3.js";
import type { AsciiBuffer, AsciiRendererContext } from "../src/types";

const blank = (cols: number, rows: number): AsciiBuffer[] =>
  Array.from({ length: cols * rows }, () => ({ char: " " }));

describe("buffer helpers", () => {
  test("fractional coordinates select the cell they fall in", () => {
    const buffer = blank(4, 3);
    setBuffer({ char: "a" }, 1.7, 2.2, buffer, 4, 3);
    mergeBuffer({ color: "red" }, 1.2, 2.9, buffer, 4, 3);
    expect(buffer[1 + 2 * 4]).toEqual({ char: "a", color: "red" });
    expect(getBuffer(1.5, 2.5, buffer, 4, 3)).toEqual({ char: "a", color: "red" });
  });

  test("NaN, infinite and out-of-range coordinates write nothing", () => {
    const buffer = blank(4, 3);
    for (const [x, y] of [[NaN, 0], [0, NaN], [Infinity, 0], [-0.5, 0], [4, 0], [0, 3]]) {
      setBuffer({ char: "x" }, x, y, buffer, 4, 3);
      mergeBuffer({ char: "x" }, x, y, buffer, 4, 3);
    }
    expect(Object.keys(buffer)).toEqual(Object.keys(blank(4, 3)));
    expect(buffer.every((c) => c.char === " ")).toBe(true);
    expect(getBuffer(NaN, 0, buffer, 4, 3)).toEqual({});
  });

  test("rects at fractional positions fill whole cells", () => {
    const buffer = blank(4, 2);
    setRectBuffer({ char: "#" }, 0.5, 0, 2, 1, buffer, 4, 2);
    expect(buffer.map((c) => c.char).join("")).toBe("##      ");
  });
});

describe("drawBox", () => {
  const charsAndColors = (buffer: AsciiBuffer[], from: number, to: number) => buffer.slice(from, to);

  test("text cells keep the box colors when the style omits them", () => {
    const cols = 12;
    const buffer = blank(cols, 5);
    drawBox("hi\n", { x: 0, y: 0, borderStyle: "single" }, buffer, cols, 5);
    // Text starts at paddingX=2, paddingY=1.
    const [h, i] = charsAndColors(buffer, 1 * cols + 2, 1 * cols + 4);
    expect(h).toMatchObject({ char: "h", color: "black", backgroundColor: "white", fontWeight: "normal" });
    expect(i).toMatchObject({ char: "i", color: "black", backgroundColor: "white" });
  });

  test("text cells use the style's fontWeight", () => {
    const cols = 12;
    const buffer = blank(cols, 5);
    drawBox("hi\n", { x: 0, y: 0, fontWeight: "700", color: "red" }, buffer, cols, 5);
    expect(buffer[1 * cols + 2]).toMatchObject({ char: "h", color: "red", fontWeight: "700" });
  });
});

describe("vec3", () => {
  test("distSqVec3 includes the z component", () => {
    const a = createVec3(1, 2, 3);
    const b = createVec3(4, 6, 15);
    expect(distSqVec3(a, b)).toBe(9 + 16 + 144);
    expect(distSqVec3(a, b)).toBeCloseTo(distVec3(a, b) ** 2, 10);
  });
});

describe("exportFrame", () => {
  afterEach(() => {
    (console.warn as unknown as { mockRestore?: () => void }).mockRestore?.();
  });

  test("warns instead of throwing when the filename has no extension", () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    const canvas = document.createElement("canvas");
    const context = { frame: 1, settings: { element: canvas } } as unknown as AsciiRendererContext;
    expect(() => exportFrame(context, "frame", 1, 1)).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("saveSourceAsFile", () => {
  test("saves .jpg and .jpeg as image/jpeg", () => {
    const types: string[] = [];
    const create = spyOn(URL, "createObjectURL").mockImplementation((blob: Blob | MediaSource) => {
      types.push((blob as Blob).type);
      return "blob:test";
    });
    saveSourceAsFile("data", "photo.jpg");
    saveSourceAsFile("data", "photo.jpeg");
    create.mockRestore();
    expect(types).toEqual(["image/jpeg", "image/jpeg"]);
  });
});
