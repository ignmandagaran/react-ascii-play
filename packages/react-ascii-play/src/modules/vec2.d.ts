/**
 * Type definitions for vec2 module
 */

export interface Vec2 {
  x: number;
  y: number;
}

export function createVec2(x: number, y: number): Vec2;
export function copyVec2(a: Vec2, out?: Vec2): Vec2;
export function addVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
export function subVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
export function mulVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
export function divVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
export function addNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
export function subNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
export function mulNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
export function divNVec2(a: Vec2, k: number, out?: Vec2): Vec2;
export function dotVec2(a: Vec2, b: Vec2): number;
export function lengthVec2(a: Vec2): number;
export function lengthSqVec2(a: Vec2): number;
export function distVec2(a: Vec2, b: Vec2): number;
export function distSqVec2(a: Vec2, b: Vec2): number;
export function normVec2(a: Vec2, out?: Vec2): Vec2;
export function negVec2(v: Vec2, out?: Vec2): Vec2;
export function rotVec2(a: Vec2, ang: number, out?: Vec2): Vec2;
export function mixVec2(a: Vec2, b: Vec2, t: number, out?: Vec2): Vec2;
export function absVec2(a: Vec2, out?: Vec2): Vec2;
export function maxVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
export function minVec2(a: Vec2, b: Vec2, out?: Vec2): Vec2;
export function fractVec2(a: Vec2, out?: Vec2): Vec2;
export function floorVec2(a: Vec2, out?: Vec2): Vec2;
export function ceilVec2(a: Vec2, out?: Vec2): Vec2;
export function roundVec2(a: Vec2, out?: Vec2): Vec2;
