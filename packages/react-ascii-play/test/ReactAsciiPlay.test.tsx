import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ReactAsciiPlay } from "../src/ReactAsciiPlay";
import type { AnimationCallback, AsciiRendererProgram, AsciiRendererSettings } from "../src/types";
import {
  installAnimationFrames,
  installIntersectionObserver,
  installLayout,
  pendingFrames,
  runFrames,
  setIntersecting,
  setVisibility,
} from "./helpers/dom-env";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// 400x96 element with 8x16 cells: a 50x6 grid.
const baseSettings: AsciiRendererSettings = { fps: 60, fontSize: "16px", lineHeight: "16px" };
const COLS = 50;
const ROWS = 6;

interface Stats {
  boot: number;
  bootBufferLength: number;
  main: number;
  frames: number[];
  userData: unknown;
}

function makeProgram(extra: { bootText?: string; noMain?: boolean } = {}) {
  const stats: Stats = { boot: 0, bootBufferLength: 0, main: 0, frames: [], userData: undefined };
  const program: AsciiRendererProgram = {
    boot(_context, buffer) {
      stats.boot++;
      stats.bootBufferLength = buffer.length;
      if (extra.bootText) [...extra.bootText].forEach((c, i) => (buffer[i].char = c));
    },
    pre(context, _cursor, _buffer, userData) {
      stats.frames.push(context.frame);
      stats.userData = userData?.tag;
    },
  };
  if (!extra.noMain) {
    program.main = () => {
      stats.main++;
      return "x";
    };
  }
  return { program, stats };
}

let container: HTMLElement;
let root: Root;

function render(element: React.ReactNode) {
  act(() => root.render(element));
}

function frames(count: number) {
  act(() => runFrames(count));
}

beforeEach(() => {
  installAnimationFrames();
  installIntersectionObserver();
  installLayout(400, 96, 8);
  setVisibility("visible");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("ReactAsciiPlay lifecycle", () => {
  test("runs boot once with a buffer sized to the grid, and renders what it wrote", () => {
    const { program, stats } = makeProgram({ bootText: "BOOT", noMain: true });
    render(<ReactAsciiPlay program={program} settings={baseSettings} />);
    frames(2);
    expect(stats.boot).toBe(1);
    expect(stats.bootBufferLength).toBe(COLS * ROWS);
    expect(container.querySelector("pre")?.textContent?.startsWith("BOOT")).toBe(true);
  });

  test("runs main once per cell per frame", () => {
    const { program, stats } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={baseSettings} />);
    frames(3);
    expect(stats.main).toBe(3 * COLS * ROWS);
  });

  test("pausing on a hidden page keeps state; resuming continues the frame count", () => {
    const { program, stats } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={baseSettings} userData={{ tag: "u1" }} />);
    frames(5);
    const mainBefore = stats.main;
    const lastFrame = stats.frames.at(-1)!;

    act(() => setVisibility("hidden"));
    frames(5);
    expect(stats.main).toBe(mainBefore);

    act(() => setVisibility("visible"));
    frames(3);
    expect(stats.main).toBeGreaterThan(mainBefore);
    expect(Math.min(...stats.frames.slice(stats.frames.indexOf(lastFrame) + 1))).toBeGreaterThan(lastFrame);
    expect(stats.boot).toBe(1);
    expect(stats.userData).toBe("u1");
  });

  test("pausing when scrolled out of view keeps state", () => {
    const { program, stats } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={baseSettings} userData={{ tag: "u1" }} />);
    frames(3);
    act(() => setIntersecting(false));
    const mainBefore = stats.main;
    frames(5);
    expect(stats.main).toBe(mainBefore);

    act(() => setIntersecting(true));
    frames(3);
    expect(stats.main).toBeGreaterThan(mainBefore);
    expect(stats.boot).toBe(1);
    expect(stats.userData).toBe("u1");
  });

  test("equal inline settings don't restart; changed settings do", () => {
    const { program, stats } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={{ ...baseSettings, intersection: { threshold: 0.2 } }} />);
    frames(2);
    render(<ReactAsciiPlay program={program} settings={{ ...baseSettings, intersection: { threshold: 0.2 } }} />);
    frames(2);
    expect(stats.boot).toBe(1);

    render(<ReactAsciiPlay program={program} settings={{ ...baseSettings, fps: 30 }} />);
    frames(2);
    expect(stats.boot).toBe(2);
  });

  test("userData updates reach the program without a restart", () => {
    const { program, stats } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={baseSettings} userData={{ tag: "u1" }} />);
    frames(2);
    render(<ReactAsciiPlay program={program} settings={baseSettings} userData={{ tag: "u2" }} />);
    frames(2);
    expect(stats.userData).toBe("u2");
    expect(stats.boot).toBe(1);
  });

  test("unmounting stops animation frames", () => {
    const { program, stats } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={baseSettings} />);
    frames(2);
    act(() => root.unmount());
    root = createRoot(container);
    const mainBefore = stats.main;
    frames(3);
    expect(stats.main).toBe(mainBefore);
    expect(pendingFrames()).toBe(0);
  });
});

describe("ReactAsciiPlay input and metrics", () => {
  test("programs with keyDown get a focusable element that receives key events", () => {
    const keys: string[] = [];
    const program: AsciiRendererProgram = {
      main: () => "x",
      keyDown(context, _cursor, _buffer, _userData, event) {
        keys.push(`${event?.key}@${context.cols}x${context.rows}`);
      },
    };
    render(<ReactAsciiPlay program={program} settings={baseSettings} />);
    const pre = container.querySelector("pre")!;
    expect(pre.tabIndex).toBe(0);
    pre.focus();
    expect(document.activeElement).toBe(pre);
    act(() => {
      pre.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    });
    expect(keys).toEqual([`a@${COLS}x${ROWS}`]);
  });

  test("programs without keyDown don't add a tab stop", () => {
    const { program } = makeProgram();
    render(<ReactAsciiPlay program={program} settings={baseSettings} />);
    expect(container.querySelector("pre")!.hasAttribute("tabindex")).toBe(false);
  });

  test("re-measures cells when a web font finishes loading", () => {
    const cols: number[] = [];
    const program: AsciiRendererProgram = {
      pre(context) {
        cols.push(context.cols);
      },
    };
    render(<ReactAsciiPlay program={program} settings={baseSettings} />);
    frames(1);
    // The loaded font is wider: 10px cells instead of 8px.
    installLayout(400, 96, 10);
    act(() => {
      document.fonts.dispatchEvent(new Event("loadingdone"));
    });
    frames(1);
    expect(cols).toEqual([COLS, 40]);
  });
});

describe("ReactAsciiPlay with an external loop", () => {
  test("callbacks a replaced loop still holds do nothing", () => {
    const { program, stats } = makeProgram();
    const retained: AnimationCallback[] = [];
    const loopA = (cb: AnimationCallback) => {
      retained.push(cb);
    };
    const loopB = (cb: AnimationCallback) => {
      retained.push(cb);
    };

    render(<ReactAsciiPlay program={program} settings={baseSettings} loop={loopA} />);
    act(() => retained[0](16));
    expect(stats.main).toBe(COLS * ROWS);

    render(<ReactAsciiPlay program={program} settings={baseSettings} loop={loopB} />);
    expect(stats.boot).toBe(2);
    const mainBefore = stats.main;
    act(() => retained[0](100));
    expect(stats.main).toBe(mainBefore);

    act(() => retained[1](200));
    expect(stats.main).toBe(mainBefore + COLS * ROWS);
  });

  test("calls the unsubscribe function the loop returned, on unmount", () => {
    const { program, stats } = makeProgram();
    let unsubscribed = 0;
    let callback: AnimationCallback | undefined;
    const loop = (cb: AnimationCallback) => {
      callback = cb;
      return () => {
        unsubscribed++;
      };
    };
    render(<ReactAsciiPlay program={program} settings={baseSettings} loop={loop} />);
    act(() => callback!(16));
    act(() => root.unmount());
    root = createRoot(container);
    expect(unsubscribed).toBe(1);

    const mainBefore = stats.main;
    act(() => callback!(1000));
    expect(stats.main).toBe(mainBefore);
  });
});
