---
"react-ascii-play": minor
---

Faster rendering with identical output, and a fixed render loop lifecycle.

- Canvas renderer: resizes only when the size changes, sets the font once per frame, skips redundant fill changes and whitespace glyphs, and caches glyph widths for centered text.
- `sdBox` and `sdSegment` no longer allocate; results are bit-identical.
- Renderers are per component instance, so several text renderers no longer force each other to redraw every row.

Behaviour changes:

- `boot` now runs when the program starts. It previously never ran.
- Pausing (tab hidden or scrolled out of view) keeps the buffer, frame count and `userData`; `boot` does not rerun on resume. Changing `program`, settings or `loop` restarts the program and runs `boot` again.
- The fps cap is accurate: `fps` equal to the display rate no longer drops frames, and renders never exceed the cap.
- Settings objects that are equal (two levels deep) no longer restart the program, so inline settings are safe.
- `loop` may return a function; it is called to unsubscribe when the loop stops. Callbacks an external loop keeps calling after a stop are ignored.
- The buffer is reset when the grid size changes.
