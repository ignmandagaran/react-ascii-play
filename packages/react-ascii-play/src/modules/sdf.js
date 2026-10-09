/**
@module   sdf.js
@desc     Some signed distance functions
@category public

SDF functions ported from the almighty Inigo Quilezles:
https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
*/

import { clampNum, mixNum } from "./num.js";
import { lengthVec2 } from "./vec2.js";

// sdBox and sdSegment run per cell, often many times per cell: they use plain
// numbers instead of vec2 helpers (which allocate), with the same operation
// order so results are bit-identical.

export function sdCircle(p, radius) {
  // vec2, float
  return lengthVec2(p) - radius;
}

export function sdBox(p, size) {
  // vec2, vec2
  const dx = Math.max(Math.abs(p.x) - size.x, 0);
  const dy = Math.max(Math.abs(p.y) - size.y, 0);
  return Math.sqrt(dx * dx + dy * dy) + Math.min(Math.max(dx, dy), 0.0);
}

export function sdSegment(p, a, b, thickness) {
  const pax = p.x - a.x;
  const pay = p.y - a.y;
  const bax = b.x - a.x;
  const bay = b.y - a.y;
  const h = clampNum((pax * bax + pay * bay) / (bax * bax + bay * bay), 0.0, 1.0);
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy) - thickness;
}

export function opSmoothUnion(d1, d2, k) {
  const h = clampNum(0.5 + (0.5 * (d2 - d1)) / k, 0.0, 1.0);
  return mixNum(d2, d1, h) - k * h * (1.0 - h);
}

export function opSmoothSubtraction(d1, d2, k) {
  const h = clampNum(0.5 - (0.5 * (d2 + d1)) / k, 0.0, 1.0);
  return mixNum(d2, -d1, h) + k * h * (1.0 - h);
}

export function opSmoothIntersection(d1, d2, k) {
  const h = clampNum(0.5 - (0.5 * (d2 - d1)) / k, 0.0, 1.0);
  return mixNum(d2, d1, h) + k * h * (1.0 - h);
}
