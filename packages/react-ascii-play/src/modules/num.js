/**
@module   num.js
@desc     Some GLSL functions ported to JS
@category public
*/

export default {
  mapNum,
  fractNum,
  clampNum,
  signNum,
  mixNum,
  smoothstepNum,
  smootherstepNum,
};

// Maps a value v from range 'in' to range 'out'
export function mapNum(v, inA, inB, outA, outB) {
  return outA + (outB - outA) * ((v - inA) / (inB - inA));
}

// Returns the fractional part of a float
export function fractNum(v) {
  return v - Math.floor(v);
}

// Clamps a value between min and max
export function clampNum(v, min, max) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

// Returns -1 for negative numbers, +1 for positive numbers, 0 for zero
export function signNum(n) {
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

// GLSL mix
export function mixNum(v1, v2, a) {
  return v1 * (1 - a) + v2 * a;
}

// GLSL step
export function stepNum(edge, x) {
  return x < edge ? 0 : 1;
}

// GLSL smoothstep
// https://en.wikipedia.org/wiki/Smoothstep
export function smoothstepNum(edge0, edge1, t) {
  const x = clampNum((t - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

// GLSL smootherstep
export function smootherstepNum(edge0, edge1, t) {
  const x = clampNum((t - edge0) / (edge1 - edge0), 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// GLSL modulo
export function modNum(a, b) {
  return a % b;
}
