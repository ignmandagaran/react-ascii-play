---
"react-ascii-play": patch
---

Fix bugs in module helpers:

- `drawBox`: text inside a box keeps the box's colors and font weight. Before, colors left out of the style were cleared under the text, and `fontWeight` was never applied (misspelled).
- `buffer` helpers: fractional coordinates (such as the cursor's) select the cell they fall in; NaN or infinite coordinates write nothing. Before, they added stray properties to the buffer array.
- `distSqVec3` includes the z component.
- `exportFrame` warns instead of throwing when the filename has no extension.
- `saveSourceAsFile` uses `image/jpeg` for `.jpg` and `.jpeg`.
