export const MODE_COVER: any;
export const MODE_FIT: any;
export const MODE_CENTER: any;
export default class Canvas {
    constructor(sourceCanvas: any);
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixels: number[];
    get width(): number;
    get height(): number;
    resize(dWidth: number, dHeight: number): this;
    copy(source: PlayCoreCanvas, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number): this;
    image(source: PlayCoreCanvas): this;
    cover(source: PlayCoreCanvas, aspect?: number): this;
    fit(source: PlayCoreCanvas, aspect?: number): this;
    center(source: PlayCoreCanvas, scaleX?: number, scaleY?: number): this;
    mirrorX(): this;
    normalize(): this;
    quantize(palette: PlayCoreCanvas): this;
    get(x: number, y: number): number;
    sample(sx: number, sy: number, gray?: boolean): number | {
        r: number;
        g: number;
        b: number;
        v: number;
    };
    loadPixels(): this;
    writeTo(buf: PlayCoreCanvas): this;
    display(target: PlayCoreCanvas, x?: number, y?: number): void;
}
