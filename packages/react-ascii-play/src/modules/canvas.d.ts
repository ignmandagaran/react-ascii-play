export const MODE_COVER: symbol;
export const MODE_FIT: symbol;
export const MODE_CENTER: symbol;

interface ColorObject {
  r: number;
  g: number;
  b: number;
  a: number;
  v: number;
}

export default class Canvas {
    constructor(sourceCanvas?: HTMLCanvasElement);
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixels: ColorObject[];
    get width(): number;
    get height(): number;
    resize(dWidth: number, dHeight: number): this;
    copy(source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, sx?: number, sy?: number, sWidth?: number, sHeight?: number, dx?: number, dy?: number, dWidth?: number, dHeight?: number): this;
    image(source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement): this;
    cover(source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, aspect?: number): this;
    fit(source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, aspect?: number): this;
    center(source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, scaleX?: number, scaleY?: number): this;
    mirrorX(): this;
    normalize(): this;
    quantize(palette: ColorObject[]): this;
    get(x: number, y: number): ColorObject;
    sample(sx: number, sy: number, gray?: boolean): number | ColorObject;
    loadPixels(): this;
    writeTo(buf: ColorObject[]): this;
    display(target?: HTMLElement, x?: number, y?: number): void;
}