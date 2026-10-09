import { AsciiBuffer } from "../types";

/**
@module   buffer.js
@desc     Safe buffer helpers, mostly for internal use
@category internal

Safe set() and get() functions, rect() and text() ‘drawing’ helpers.

Buffers are 1D arrays for 2D data, a ‘width’ and a 'height' parameter
have to be known (and passed to the functions) to correctly / safely access
the array.

const v = get(10, 10, buffer, cols, rows)

*/
/** A cell to merge: any subset of cell fields. */
export type CellValue = Partial<AsciiBuffer>;

/** A cell to store: a cell object, or a plain character (string or number). */
export type CellOrChar = AsciiBuffer | string | number;

/** Text to merge, either plain or with cell fields applied to every char. */
export type TextValue = string | (Partial<Omit<AsciiBuffer, "char">> & { text: string });

export function getBuffer(
  x: number,
  y: number,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): Partial<AsciiBuffer> | undefined;
export function setBuffer(
  val: CellOrChar,
  x: number,
  y: number,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): void;
export function mergeBuffer(
  val: CellValue,
  x: number,
  y: number,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): void;
export function setRectBuffer(
  val: CellOrChar,
  x: number,
  y: number,
  w: number,
  h: number,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): void;
export function mergeRectBuffer(
  val: CellValue,
  x: number,
  y: number,
  w: number,
  h: number,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): void;
export function mergeTextBuffer(
  textObj: TextValue,
  x: number,
  y: number,
  target: AsciiBuffer[],
  targetCols: number,
  targetRows: number
): {
  offset: {
    col: number;
    row: number;
  };
  wrapInfo: {
    first: Partial<AsciiBuffer> | undefined;
    last: Partial<AsciiBuffer> | undefined;
  }[];
};
