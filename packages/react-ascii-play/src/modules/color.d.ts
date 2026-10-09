/**
@module   color.js
@desc     Some common palettes and simple color helpers
@category public

Colors can be defined as:

rgb : { r:255, g:0, b:0 }
int : 16711680 (0xff0000)
hex : '#FF0000'
css : 'rgb(255,0,0)'

CSS1 and CSS3 palettes are exported as maps
C64 and CGA palettes are exported as arrays

Most of the times colors are ready to use as in CSS:
this means r,g,b have 0-255 range but alpha 0-1

Colors in exported palettes are augmented to:
{
    name : 'red',
    r    : 255,        // 0-255 (as in CSS)
    g    : 0,          // 0-255 (as in CSS)
    b    : 0,          // 0-255 (as in CSS)
    a    : 1.0,        // 0-1   (as in CSS)
    v    : 0.6,        // 0-1   (gray value)
    hex  : '#FF0000',
    css  : 'rgb(255,0,0)'
    int  : 16711680
}

*/
export function rgb(
  r: number,
  g: number,
  b: number,
  a?: number
): {
  r: number;
  g: number;
  b: number;
  a: number;
};
export function hex(r: number, g: number, b: number, a?: number): string;
export function css(r: number, g: number, b: number, a?: number): string;
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** A palette entry: the color in every supported representation. */
export interface PaletteColor {
  name: string;
  int: number;
  r: number;
  g: number;
  b: number;
  a: number;
  v: number;
  hex: string;
  css: string;
}

export function rgb2css(rgb: RGBA): string;
export function rgb2hex(rgb: RGBA): string;
export function rgb2gray(rgb: RGBA): number;
export function int2rgb(int: number): {
  a: number;
  r: number;
  g: number;
  b: number;
};
export const CSS4: Record<string, PaletteColor>;
export const CSS3: Record<string, PaletteColor>;
export const CSS2: Record<string, PaletteColor>;
export const CSS1: Record<string, PaletteColor>;
export const C64: PaletteColor[];
export const CGA: PaletteColor[];
