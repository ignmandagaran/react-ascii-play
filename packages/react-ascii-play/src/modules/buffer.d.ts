import { PlayCoreAsciiBuffer } from "../types";

/**
@module   buffer.cjs
@desc     Safe buffer helpers, mostly for internal use
@category internal

Safe set() and get() functions, rect() and text() ‘drawing’ helpers.

Buffers are 1D arrays for 2D data, a ‘width’ and a 'height' parameter
have to be known (and passed to the functions) to correctly / safely access
the array.

const v = get(10, 10, buffer, cols, rows)

*/
export function getBuffer(x: number, y: number, target: PlayCoreAsciiBuffer[], targetCols: number, targetRows: number): number;
export function setBuffer(val: number, x: number, y: number, target: PlayCoreAsciiBuffer[], targetCols: number, targetRows: number): void;
export function mergeBuffer(val: number, x: number, y: number, target: PlayCoreAsciiBuffer[], targetCols: number, targetRows: number): void;
export function setRectBuffer(val: number, x: number, y: number, w: number, h: number, target: PlayCoreAsciiBuffer[], targetCols: number, targetRows: number): void;
export function mergeRectBuffer(val: number, x: number, y: number, w: number, h: number, target: PlayCoreAsciiBuffer[], targetCols: number, targetRows: number): void;
export function mergeTextBuffer(textObj: Record<{char: string, color: number}, number>[], x: number, y: number, target: PlayCoreAsciiBuffer[], targetCols: number, targetRows: number): {
    offset: {
        col: number;
        row: number;
    };
    wrapInfo: number[];
};
