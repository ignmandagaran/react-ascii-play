import { AsciiBuffer, AsciiRendererContext, AsciiRendererCursor } from "../types";

export type BorderStyle = "double" | "single" | "round" | "singleDouble" | "fat" | "none";
export type ShadowStyle = "light" | "medium" | "dark" | "solid" | "checker" | "x" | "gray" | "none";

export interface DrawBoxStyle {
  x?: number;
  y?: number;
  /** 0 sizes the box to the text. */
  width?: number;
  /** 0 sizes the box to the text. */
  height?: number;
  paddingX?: number;
  paddingY?: number;
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  shadowStyle?: ShadowStyle;
  borderStyle?: BorderStyle;
  shadowX?: number;
  shadowY?: number;
}

export function drawBox(
  text: string,
  style: DrawBoxStyle,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): void;
export function drawInfo(
  context: AsciiRendererContext,
  cursor: AsciiRendererCursor,
  target: AsciiBuffer[],
  style?: DrawBoxStyle
): void;
