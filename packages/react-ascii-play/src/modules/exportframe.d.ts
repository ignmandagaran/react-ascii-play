import { AsciiRendererContext } from "../types";

/**
Exports the canvas of a canvas renderer as an image, for frames `from` to `to`.
Call it every frame (e.g. from `post`); it saves only inside the range.
*/
export function exportFrame(
  context: AsciiRendererContext,
  filename: string,
  from?: number,
  to?: number
): void;
