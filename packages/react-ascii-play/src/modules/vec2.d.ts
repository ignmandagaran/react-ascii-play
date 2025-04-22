/**
 * Type definitions for vec2 module
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec2Module {
  createVec2(x: number, y: number): Vec2;
  copyVec2(a: Vec2, out?: Vec2): Vec2;
  addVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
  subVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
  mulVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
  divVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
  addNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
  subNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
  mulNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
  divNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
  dotVec2(a: Vec2, b: Vec2): number;
  lengthVec2(a: Vec2): number;
  lengthSqVec2(a: Vec2): number;
  distVec2(a: Vec2, b: Vec2): number;
  distSqVec2(a: Vec2, b: Vec2): number;
  normVec2(a: Vec2, out?: Vec2): Vec2;
  negVec2(v: Vec2, out?: Vec2): Vec2;
  rotVec2(a: Vec2, ang: number, out?: Vec2): Vec2;
  mixVec2(a: Vec2, b: Vec2, t: number, out?: Vec2): Vec2;
  absVec2(a: Vec2, out?: Vec2): Vec2;
  maxVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
  minVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
  fractVec2(a: Vec2, out?: Vec2): Vec2;
  floorVec2(a: Vec2, out?: Vec2): Vec2;
  ceilVec2(a: Vec2, out?: Vec2): Vec2;
  roundVec2(a: Vec2, out?: Vec2): Vec2;
}

declare const vec2: Vec2Module;

export { vec2 };
