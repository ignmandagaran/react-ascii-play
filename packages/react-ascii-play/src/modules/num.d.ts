/**
@module   num.cjs
@desc     Some GLSL functions ported to JS
@category public
*/

export function mapNum(
  v: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number
): number;
export function fractNum(v: number): number;
export function clampNum(v: number, min: number, max: number): number;
export function signNum(n: number): 0 | 1 | -1;
export function mixNum(v1: number, v2: number, a: number): number;
export function stepNum(edge: number, x: number): 0 | 1;
export function smoothstepNum(edge0: number, edge1: number, t: number): number;
export function smootherstepNum(
  edge0: number,
  edge1: number,
  t: number
): number;
export function modNum(a: number, b: number): number;
