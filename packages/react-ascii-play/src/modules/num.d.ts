export function map(v: number, inA: number, inB: number, outA: number, outB: number): number;
export function fract(v: number): number;
export function clamp(v: number, min: number, max: number): number;
export function sign(n: number): 0 | 1 | -1;
export function mix(v1: number, v2: number, a: number): number;
export function step(edge: number, x: number): 0 | 1;
export function smoothstep(edge0: number, edge1: number, t: number): number;
export function smootherstep(edge0: number, edge1: number, t: number): number;
export function mod(a: number, b: number): number;
declare namespace _default {
    export { map };
    export { fract };
    export { clamp };
    export { sign };
    export { mix };
    export { smoothstep };
    export { smootherstep };
}
export default _default;
