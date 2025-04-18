/**
@module   string.js
@desc     String helpers
@category internal

Wraps a string to a specific width.
Doesn’t break words and keeps trailing line breaks.
Counts lines and maxWidth (can be greater than width).
If no width is passed the function just measures the 'box' of the text.
*/
export function wrap(string: any, width?: number): {
    text: any;
    numLines: number;
    maxWidth: number;
};
export function measure(string: any): {
    text: any;
    numLines: number;
    maxWidth: number;
};
