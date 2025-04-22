/**
 * Type definitions for vec2 module
 */

interface Vec2 {
    x: number;
    y: number;
}

interface Vec2Module {
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

export type { Vec2 };
export const createVec2: Vec2Module['createVec2'];
export const copyVec2: Vec2Module['copyVec2'];
export const addVec2: Vec2Module['addVec2'];
export const subVec2: Vec2Module['subVec2'];
export const mulVec2: Vec2Module['mulVec2'];
export const divVec2: Vec2Module['divVec2'];
export const addNVec2: Vec2Module['addNVec2'];
export const subNVec2: Vec2Module['subNVec2'];
export const mulNVec2: Vec2Module['mulNVec2'];
export const divNVec2: Vec2Module['divNVec2'];
export const dotVec2: Vec2Module['dotVec2'];
export const lengthVec2: Vec2Module['lengthVec2'];
export const lengthSqVec2: Vec2Module['lengthSqVec2'];
export const distVec2: Vec2Module['distVec2'];
export const distSqVec2: Vec2Module['distSqVec2'];
export const normVec2: Vec2Module['normVec2'];
export const negVec2: Vec2Module['negVec2'];
export const rotVec2: Vec2Module['rotVec2'];
export const mixVec2: Vec2Module['mixVec2'];
export const absVec2: Vec2Module['absVec2'];
export const maxVec2: Vec2Module['maxVec2'];
export const minVec2: Vec2Module['minVec2'];
export const fractVec2: Vec2Module['fractVec2'];
export const floorVec2: Vec2Module['floorVec2'];
export const ceilVec2: Vec2Module['ceilVec2'];
export const roundVec2: Vec2Module['roundVec2'];