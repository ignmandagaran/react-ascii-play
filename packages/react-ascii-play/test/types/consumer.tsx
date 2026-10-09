// Compiled against the built package (dist) with skipLibCheck off, the way a
// consumer's project sees it. Every subpath export is imported and used with
// the argument shapes the implementation expects. Run with `bun run check:types`.

import { ReactAsciiPlay, type AsciiRendererProgram, type AsciiRendererSettings } from "react-ascii-play";
import { getBuffer, mergeBuffer, mergeTextBuffer, setBuffer, setRectBuffer, mergeRectBuffer } from "react-ascii-play/modules/buffer";
import { initCamera } from "react-ascii-play/modules/camera";
import Canvas, { MODE_COVER, MODE_FIT, MODE_CENTER } from "react-ascii-play/modules/canvas";
import { C64, CGA, CSS1, CSS2, CSS3, CSS4, css, hex, int2rgb, rgb, rgb2css, rgb2gray, rgb2hex } from "react-ascii-play/modules/color";
import { drawBox, drawInfo } from "react-ascii-play/modules/drawbox";
import { exportFrame } from "react-ascii-play/modules/exportframe";
import { saveBlobAsFile, saveSourceAsFile } from "react-ascii-play/modules/filedownload";
import { drawImageOnCanvas } from "react-ascii-play/modules/image";
import { loadImage, loadJson, loadText } from "react-ascii-play/modules/load";
import num, { clampNum, mapNum, modNum } from "react-ascii-play/modules/num";
import { sdBox, sdCircle, sdSegment } from "react-ascii-play/modules/sdf";
import { sortAscii } from "react-ascii-play/modules/sort";
import { measureString, wrapString } from "react-ascii-play/modules/string";
import { createVec2, type Vec2 } from "react-ascii-play/modules/vec2";
import { createVec3, distSqVec3, type Vec3 } from "react-ascii-play/modules/vec3";

const settings: AsciiRendererSettings = {
  renderer: "canvas",
  cols: 80,
  rows: 24,
  canvasSize: { width: 640, height: 480 },
  canvasOffset: { x: "auto", y: 10 },
};

const camera = initCamera((source) => source);
const image = drawImageOnCanvas("image.png");
const palette = new Canvas().cover(camera, 0.5).quantize(C64);
const modes: symbol[] = [MODE_COVER, MODE_FIT, MODE_CENTER];

const program: AsciiRendererProgram = {
  boot(context, buffer) {
    setBuffer({ char: "x" }, 0, 0, buffer, context.cols, context.rows);
    setRectBuffer({ char: " " }, 0, 0, 4, 2, buffer, context.cols, context.rows);
    // Plain characters are accepted as cell values too.
    setBuffer("x", 1, 0, buffer, context.cols, context.rows);
    setBuffer(7, 2, 0, buffer, context.cols, context.rows);
    setRectBuffer("#", 0, 1, 4, 1, buffer, context.cols, context.rows);
  },
  main(coord, context, cursor) {
    const p: Vec2 = createVec2(coord.x / context.cols, coord.y / context.rows);
    const d = Math.min(
      sdCircle(p, 0.3),
      sdBox(p, createVec2(0.2, 0.1)),
      sdSegment(p, createVec2(0, 0), createVec2(cursor.x, cursor.y), 0.01)
    );
    const color = image.sample(p.x, p.y);
    return { char: d < 0 ? "#" : " ", color: typeof color === "number" ? undefined : rgb2css(color) };
  },
  post(context, cursor, buffer) {
    mergeBuffer({ color: CSS4.red.css }, 1, 1, buffer, context.cols, context.rows);
    mergeRectBuffer({ backgroundColor: CGA[1].hex }, 0, 0, 3, 3, buffer, context.cols, context.rows);
    const { offset, wrapInfo } = mergeTextBuffer({ text: "hi", color: "red" }, 2, 2, buffer, context.cols, context.rows);
    mergeTextBuffer("plain", offset.col, offset.row + wrapInfo.length, buffer, context.cols, context.rows);
    const first: string | number | undefined = getBuffer(0, 0, buffer, context.cols, context.rows)?.char;
    void first;
    drawBox("box\n", { borderStyle: "double", shadowStyle: "light", color: "white" }, buffer, context.cols, context.rows);
    drawInfo(context, cursor, buffer, { x: 1 });
    exportFrame(context, "frame.png", 1, 10);
    const element: HTMLPreElement | HTMLCanvasElement = context.settings.element;
    void element;
  },
};

async function loaders() {
  const img: HTMLImageElement | null = await loadImage("a.png");
  const data: unknown = await loadJson("a.json");
  const text: string = await loadText("a.txt");
  saveSourceAsFile(text, "a.txt");
  saveBlobAsFile(new Blob([text]), "a.txt");
  return [img, data];
}

const sorted: string = sortAscii(" .:-=+*#%@", "monospace");
const sortedFromArray: string | string[] = sortAscii([" ", ".", "#"], "monospace", true);
const sizes = [measureString("a\nb").maxWidth, wrapString("a b c", 2).numLines];
const nums = [num.mapNum(1, 0, 1, 0, 2), mapNum(1, 0, 1, 0, 2), clampNum(2, 0, 1), modNum(-1, 3)];
const colors = [rgb(1, 2, 3).r, hex(1, 2, 3), css(1, 2, 3), rgb2hex({ r: 1, g: 2, b: 3 }), rgb2gray(int2rgb(0xff0000)), CSS1.black.v, CSS2.orange.int, CSS3.red.name];
const v3: Vec3 = createVec3(1, 2, 3);
const distance = distSqVec3(v3, v3);

export const usage = [settings, palette, modes, program, loaders, sorted, sortedFromArray, sizes, nums, colors, distance];
export const element = <ReactAsciiPlay program={program} settings={settings} />;
