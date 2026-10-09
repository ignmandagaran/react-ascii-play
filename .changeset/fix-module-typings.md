---
"react-ascii-play": patch
---

Fix the published TypeScript declarations:

- `modules/camera`: `initCamera` was not exported from its declaration, so the module had no types.
- `modules/canvas`, `modules/color`: declarations no longer contain initializers (a compile error with `skipLibCheck: false`). Palettes are typed as `PaletteColor` maps/arrays, and `rgb2css`/`rgb2hex`/`rgb2gray` take `{ r, g, b, a? }`.
- `modules/sdf`: imports the `Vec2` type it uses.
- `modules/buffer`: values are typed as cells (or plain characters for `setBuffer`/`setRectBuffer`) instead of numbers; `mergeTextBuffer` accepts a string or `{ text, ...cell }`.
- `modules/sort`: `sortAscii` returns the sorted characters as a string (it was declared as an array); it accepts a string or an array.
- `modules/exportframe`, `modules/filedownload`, `modules/drawbox`, `modules/num`: argument types match the implementation; `num` declares its default export.
- `modules/load`: `loadImage` may resolve to `null`; `loadJson` resolves to `unknown` instead of `any`.
- `AsciiRendererSettings` declares `canvasSize` and `canvasOffset`, and `context.settings.element` is typed.
