
// Vec3 Types
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface Vec3Module {
    create(x: number, y: number, z: number): Vec3;
    copy(a: Vec3, out?: Vec3): Vec3;
    add(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    sub(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    mul(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    div(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    addN(a: Vec3, k: number, out?: Vec3): Vec3;
    subN(a: Vec3, k: number, out?: Vec3): Vec3;
    mulN(a: Vec3, k: number, out?: Vec3): Vec3;
    divN(a: Vec3, k: number, out?: Vec3): Vec3;
    dot(a: Vec3, b: Vec3): number;
    cross(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    length(a: Vec3): number;
    lengthSq(a: Vec3): number;
    dist(a: Vec3, b: Vec3): number;
    distSq(a: Vec3, b: Vec3): number;
    norm(a: Vec3, out?: Vec3): Vec3;
    neg(v: Vec3, out?: Vec3): Vec3;
    rotX(v: Vec3, ang: number, out?: Vec3): Vec3;
    rotY(v: Vec3, ang: number, out?: Vec3): Vec3;
    rotZ(v: Vec3, ang: number, out?: Vec3): Vec3;
    mix(a: Vec3, b: Vec3, t: number, out?: Vec3): Vec3;
    abs(a: Vec3, out?: Vec3): Vec3;
    max(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    min(a: Vec3, b: Vec3, out?: Vec3): Vec3;
    fract(a: Vec3, out?: Vec3): Vec3;
    floor(a: Vec3, out?: Vec3): Vec3;
    ceil(a: Vec3, out?: Vec3): Vec3;
    round(a: Vec3, out?: Vec3): Vec3;
}

declare const vec3: Vec3Module;

export { vec3 }; 