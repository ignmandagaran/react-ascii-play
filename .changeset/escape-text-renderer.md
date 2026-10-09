---
"react-ascii-play": patch
---

The text renderer escapes cell characters and style values before writing rows as HTML. Characters such as `<` and `&` now render as text, and text from user input can no longer inject markup. `beginHTML`/`endHTML` are still written as-is and must only contain trusted markup.
