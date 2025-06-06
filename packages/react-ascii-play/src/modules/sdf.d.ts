/**
@module   sdf.js
@desc     Some signed distance functions
@category public

SDF functions ported from the almighty Inigo Quilezles:
https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
*/

export function sdCircle(p: Vec2, radius: number): number;
export function sdBox(p: Vec2, size: Vec2): number;
export function sdSegment(p: Vec2, a: Vec2, b: Vec2, thickness: number): number;
export function opSmoothUnion(d1: number, d2: number, k: number): number;
export function opSmoothSubtraction(d1: number, d2: number, k: number): number;
export function opSmoothIntersection(d1: number, d2: number, k: number): number;
