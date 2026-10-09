/**
@module   sort.cjs
@desc     Sorts a set of characters by brightness
@category public

Paints chars on a temporary canvas and counts the pixels.
This could be done once and then stored / hardcoded.
The fontFamily paramter needs to be set because it's used by the canvas element
to draw the correct font.
*/
export function sortAscii(
  charSet: string,
  fontFamily: string,
  ascending?: boolean
): string;
/**
 * Arrays are sorted into a string too. If the browser can't read canvas
 * pixels, the input is returned unchanged, so the array comes back as is.
 */
export function sortAscii(
  charSet: string[],
  fontFamily: string,
  ascending?: boolean
): string | string[];
