/**
 * Type definitions for vec2 module
 */

export interface Vec2 {
    x: number;
    y: number;
}

export interface Vec2Module {
    vec2(x: number, y: number): Vec2;
    copy(a: Vec2, out?: Vec2): Vec2;
    add(a: Vec2, b: Vec2, out?: Vec2): Vec2;
    sub(a: Vec2, b: Vec2, out?: Vec2): Vec2;
    mul(a: Vec2, b: Vec2, out?: Vec2): Vec2;
    div(a: Vec2, b: Vec2, out?: Vec2): Vec2;
    addN(a: Vec2, k: number, out?: Vec2): Vec2;
    subN(a: Vec2, k: number, out?: Vec2): Vec2;
    mulN(a: Vec2, k: number, out?: Vec2): Vec2;
    divN(a: Vec2, k: number, out?: Vec2): Vec2;
    dot(a: Vec2, b: Vec2): number;
    length(a: Vec2): number;
    lengthSq(a: Vec2): number;
    dist(a: Vec2, b: Vec2): number;
    distSq(a: Vec2, b: Vec2): number;
    norm(a: Vec2, out?: Vec2): Vec2;
    neg(v: Vec2, out?: Vec2): Vec2;
    rot(a: Vec2, ang: number, out?: Vec2): Vec2;
    mix(a: Vec2, b: Vec2, t: number, out?: Vec2): Vec2;
    abs(a: Vec2, out?: Vec2): Vec2;
    max(a: Vec2, b: Vec2, out?: Vec2): Vec2;
    min(a: Vec2, b: Vec2, out?: Vec2): Vec2;
    fract(a: Vec2, out?: Vec2): Vec2;
    floor(a: Vec2, out?: Vec2): Vec2;
    ceil(a: Vec2, out?: Vec2): Vec2;
    round(a: Vec2, out?: Vec2): Vec2;
}