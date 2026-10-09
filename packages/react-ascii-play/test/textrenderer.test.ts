import { describe, expect, test } from "bun:test";
import { createTextRenderer } from "../src/core/textrenderer.js";
import type { AsciiBuffer, AsciiRendererContext, AsciiRendererSettings } from "../src/types";

const metrics = { cellWidth: 8, lineHeight: 16, fontSize: 16, fontFamily: "monospace", aspect: 0.5 };

function makeContext(element: HTMLPreElement, cols: number, rows: number, settings: AsciiRendererSettings = {}): AsciiRendererContext {
  return {
    frame: 0, time: 0, cols, rows, metrics,
    width: cols * metrics.cellWidth, height: rows * metrics.lineHeight,
    settings: { ...settings, element },
    runtime: { cycle: 0, fps: 60 },
  };
}

const rowsOf = (pre: HTMLPreElement) => Array.from(pre.children).map((row) => row.textContent);

function fill(cols: number, rows: number, char: (i: number) => string): AsciiBuffer[] {
  return Array.from({ length: cols * rows }, (_, i) => ({ char: char(i) }));
}

describe("text renderer", () => {
  test("writes one block span per row with the buffer's characters", () => {
    const pre = document.createElement("pre");
    const ctx = makeContext(pre, 4, 2);
    createTextRenderer().render(ctx, fill(4, 2, (i) => "abcdefgh"[i]), ctx.settings);
    expect(rowsOf(pre)).toEqual(["abcd", "efgh"]);
  });

  test("wraps style changes in spans and omits styles equal to the settings", () => {
    const pre = document.createElement("pre");
    const ctx = makeContext(pre, 3, 1, { color: "black" });
    const buffer: AsciiBuffer[] = [
      { char: "a", color: "black" },
      { char: "b", color: "red", fontWeight: "700" },
      { char: "c", color: "red", fontWeight: "700" },
    ];
    createTextRenderer().render(ctx, buffer, ctx.settings);
    expect(pre.children[0].innerHTML).toBe('<span>a</span><span style="color:red;font-weight:700;">bc</span>');
  });

  test("renders markup characters as text", () => {
    const pre = document.createElement("pre");
    const ctx = makeContext(pre, 4, 1);
    const buffer: AsciiBuffer[] = [{ char: "<" }, { char: "&" }, { char: ">" }, { char: "<img src=x onerror=alert(1)>" }];
    createTextRenderer().render(ctx, buffer, ctx.settings);
    expect(pre.querySelector("img")).toBeNull();
    expect(rowsOf(pre)).toEqual(["<&><img src=x onerror=alert(1)>"]);
  });

  test("keeps style values inside the style attribute", () => {
    const pre = document.createElement("pre");
    const ctx = makeContext(pre, 1, 1);
    const buffer: AsciiBuffer[] = [{ char: "a", color: 'red" onmouseover="alert(1)' }];
    createTextRenderer().render(ctx, buffer, ctx.settings);
    const span = pre.querySelector("span span") as HTMLElement;
    expect(span.getAttributeNames()).toEqual(["style"]);
    expect(span.textContent).toBe("a");
  });

  test("still writes beginHTML and endHTML as markup", () => {
    const pre = document.createElement("pre");
    const ctx = makeContext(pre, 1, 1);
    const buffer: (AsciiBuffer & { beginHTML?: string; endHTML?: string })[] = [
      { char: "a", beginHTML: '<a href="#x">', endHTML: "</a>" },
    ];
    createTextRenderer().render(ctx, buffer, ctx.settings);
    expect(pre.querySelector("a")?.textContent).toBe("a");
  });

  test("rewrites only the rows that changed", () => {
    const pre = document.createElement("pre");
    const ctx = makeContext(pre, 3, 3);
    const renderer = createTextRenderer();
    renderer.render(ctx, fill(3, 3, () => "x"), ctx.settings);

    const observer = new MutationObserver(() => {});
    observer.observe(pre, { childList: true, subtree: true, characterData: true });
    const next = fill(3, 3, () => "x");
    next[4] = { char: "o" };
    renderer.render(ctx, next, ctx.settings);
    const touchedRows = new Set(
      observer.takeRecords().map((r) => Array.from(pre.children).indexOf((r.target as Element).closest("pre > *") as Element))
    );
    observer.disconnect();
    expect([...touchedRows]).toEqual([1]);
    expect(rowsOf(pre)).toEqual(["xxx", "xox", "xxx"]);
  });

  test("instances keep separate back buffers", () => {
    const preA = document.createElement("pre");
    const preB = document.createElement("pre");
    const ctxA = makeContext(preA, 3, 2);
    const ctxB = makeContext(preB, 3, 2);
    const a = createTextRenderer();
    const b = createTextRenderer();
    const bufA = fill(3, 2, () => "a");
    const bufB = fill(3, 2, () => "b");
    a.render(ctxA, bufA, ctxA.settings);
    b.render(ctxB, bufB, ctxB.settings);

    const observer = new MutationObserver(() => {});
    observer.observe(preA, { childList: true, subtree: true, characterData: true });
    observer.observe(preB, { childList: true, subtree: true, characterData: true });
    for (let i = 0; i < 3; i++) {
      a.render(ctxA, bufA, ctxA.settings);
      b.render(ctxB, bufB, ctxB.settings);
    }
    expect(observer.takeRecords()).toHaveLength(0);
    observer.disconnect();
  });
});
