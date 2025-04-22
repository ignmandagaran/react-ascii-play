import { PlayCoreAsciiBuffer } from "../types";

export function drawBox(text: string, style: Record<string, number | string>, target: PlayCoreAsciiBuffer, targetCols: number, targetRows: number): void;
export function drawInfo(context: PlayCoreAsciiContext, cursor: PlayCoreAsciiCursor, target: PlayCoreAsciiBuffer, style: Record<string, number | string>): void;
