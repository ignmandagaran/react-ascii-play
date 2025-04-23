/**
@module   sdf.js
@desc     Some signed distance functions
@category public

SDF functions ported from the almighty Inigo Quilezles:
https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
*/

import { clampNum, mixNum } from "./num.js";
import { lengthVec2, subVec2, dotVec2, mulNVec2 } from "./vec2.js";

export function sdCircle(p, radius) {
  // vec2, float
  return lengthVec2(p) - radius;
}

export function sdBox(p, size) {
  // vec2, vec2
  const d = {
    x: Math.abs(p.x) - size.x,
    y: Math.abs(p.y) - size.y,
  };
  d.x = Math.max(d.x, 0);
  d.y = Math.max(d.y, 0);
  return lengthVec2(d) + Math.min(Math.max(d.x, d.y), 0.0);
}

export function sdSegment(p, a, b, thickness) {
  const pa = subVec2(p, a);
  const ba = subVec2(b, a);
  const h = clampNum(dotVec2(pa, ba) / dotVec2(ba, ba), 0.0, 1.0);
  return lengthVec2(subVec2(pa, mulNVec2(ba, h))) - thickness;
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
