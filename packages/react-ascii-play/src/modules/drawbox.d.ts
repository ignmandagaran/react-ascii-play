import { AsciiBuffer, AsciiRendererContext, AsciiRendererCursor } from "../types";

export function drawBox(
  text: string,
  style: Record<string, number | string>,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): void;
export function drawInfo(
  context: AsciiRendererContext,
  cursor: AsciiRendererCursor,
  target: AsciiBuffer[],
  style?: Record<string, number | string>
): void;
