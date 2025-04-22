
// Vec3 Types
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface Vec3Module {
    createVec3(x: number, y: number, z: number): Vec3;
    copyVec3(a: Vec3, out?: Vec3): Vec3;
    addVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    subVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    mulVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    divVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    addNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
    subNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
    mulNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
    divNVec3(a: Vec3, k: number, out?: Vec3): Vec3;
    dotVec3(a: Vec3, b: Vec3): number;
    crossVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    lengthVec3(a: Vec3): number;
    lengthSqVec3(a: Vec3): number;
    distVec3(a: Vec3, b: Vec3): number;
    distSqVec3(a: Vec3, b: Vec3): number;
    normVec3(a: Vec3, out?: Vec3): Vec3;
    negVec3(v: Vec3, out?: Vec3): Vec3;
    rotXVec3(v: Vec3, ang: number, out?: Vec3): Vec3;
    rotYVec3(v: Vec3, ang: number, out?: Vec3): Vec3;
    rotZVec3(v: Vec3, ang: number, out?: Vec3): Vec3;
    mixVec3(a: Vec3, b: Vec3, t: number, out?: Vec3): Vec3;
    absVec3(a: Vec3, out?: Vec3): Vec3;
    maxVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    minVec3(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    fractVec3(a: Vec3, out?: Vec3): Vec3;
    floorVec3(a: Vec3, out?: Vec3): Vec3;
    ceilVec3(a: Vec3, out?: Vec3): Vec3;
    roundVec3(a: Vec3, out?: Vec3): Vec3;
}

declare const vec3: Vec3Module;

export { vec3 }; 