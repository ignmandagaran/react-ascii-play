// Vec3 Types
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export function createVec3(x: number, y: number, z: number): Vec3;
export function copyVec3(a: Vec3, out?: Vec3): Vec3;
export function addVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function subVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function mulVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function divVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function addNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
export function subNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
export function mulNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
export function divNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
export function dotVec3(a: Vec3, b: Vec3): number;
export function crossVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function lengthVec3(a: Vec3): number;
export function lengthSqVec3(a: Vec3): number;
export function distVec3(a: Vec3, b: Vec3): number;
export function distSqVec3(a: Vec3, b: Vec3): number;
export function normVec3(a: Vec3, out?: Vec3): Vec3;
export function negVec3(v: Vec3, out?: Vec3): Vec3;
export function rotXVec3(v: Vec3, ang: number, out?: Vec3): Vec3;
export function rotYVec3(v: Vec3, ang: number, out?: Vec3): Vec3;
export function rotZVec3(v: Vec3, ang: number, out?: Vec3): Vec3;
export function mixVec3(a: Vec3, b: Vec3, t: number, out?: Vec3): Vec3;
export function absVec3(a: Vec3, out?: Vec3): Vec3;
export function maxVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function minVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
export function fractVec3(a: Vec3, out?: Vec3): Vec3;
export function floorVec3(a: Vec3, out?: Vec3): Vec3;
export function ceilVec3(a: Vec3, out?: Vec3): Vec3;
export function roundVec3(a: Vec3, out?: Vec3): Vec3;
