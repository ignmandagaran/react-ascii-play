export function map(v: any, inA: any, inB: any, outA: any, outB: any): any;
export function fract(v: any): number;
export function clamp(v: any, min: any, max: any): any;
export function sign(n: any): 0 | 1 | -1;
export function mix(v1: any, v2: any, a: any): number;
export function step(edge: any, x: any): 0 | 1;
export function smoothstep(edge0: any, edge1: any, t: any): number;
export function smootherstep(edge0: any, edge1: any, t: any): number;
export function mod(a: any, b: any): number;
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
