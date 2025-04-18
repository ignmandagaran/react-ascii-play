/**
@module   sort.js
@desc     Sorts a set of characters by brightness
@category public

Paints chars on a temporary canvas and counts the pixels.
This could be done once and then stored / hardcoded.
The fontFamily paramter needs to be set because it's used by the canvas element
to draw the correct font.
*/
export function sort(charSet: string[], fontFamily: string, ascending?: boolean): string[];
