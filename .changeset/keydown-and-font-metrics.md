---
"react-ascii-play": patch
---

- `keyDown` now fires: when a program defines it, the rendered element is focusable (`tabIndex=0`), so it receives key events once clicked or tabbed to. Programs without `keyDown` don't add a tab stop.
- Character metrics are re-measured when a web font finishes loading, so the grid no longer keeps the fallback font's cell size until the window is resized.
