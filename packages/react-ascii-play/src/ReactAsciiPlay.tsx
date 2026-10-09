import { RefObject, useState } from "react";

import type {
  AsciiRendererSettings,
  AsciiRendererContext,
  AsciiRendererCursor,
  AsciiBuffer,
  AsciiMetrics,
  ProgramState,
  AnimationCallback,
  AsciiRendererProgram,
} from "./types";
import { useEffect, useRef, useMemo } from "react";
import { createTextRenderer, type TextRenderer } from "./core/textrenderer";
import { createCanvasRenderer, type CanvasRenderer } from "./core/canvasrenderer";
import { createFrameCap } from "./core/framecap";
import FPS from "./core/fps";
import React from "react";
import useIntersection from "./hooks/use-intersection";

interface RendererElementProps {
  renderer: "text" | "canvas";
  settings?: AsciiRendererSettings;
  className?: string;
  ref?: React.RefObject<HTMLPreElement | HTMLCanvasElement | null>;
}

// Calcs width (fract), height, aspect of a monospaced char
// assuming that the CSS font-family is a monospaced font.
// Returns a mutable object.
// eslint-disable-next-line react-refresh/only-export-components
export function calcMetrics(el: HTMLPreElement | HTMLCanvasElement) {
  const style = getComputedStyle(el);

  // Extract info from the style: in case of a canvas element
  // the style and font family should be set anyways.
  const fontFamily = style.getPropertyValue("font-family");
  const fontSize = parseFloat(style.getPropertyValue("font-size"));
  // Can't rely on computed lineHeight since Safari 14.1
  // See:  https://bugs.webkit.org/show_bug.cgi?id=225695
  const lineHeight = parseFloat(style.getPropertyValue("line-height"));
  let cellWidth;

  // If the output element is a canvas 'measureText()' is used
  // else cellWidth is computed 'by hand' (should be the same, in any case)
  if (el.nodeName == "CANVAS") {
    const ctx = (el as HTMLCanvasElement).getContext("2d");
    if (!ctx) return null;
    ctx.font = fontSize + "px " + fontFamily;
    cellWidth = ctx.measureText("".padEnd(50, "X")).width / 50;
  } else {
    const span = document.createElement("span");
    el.appendChild(span);
    span.innerHTML = "".padEnd(50, "X");
    cellWidth = span.getBoundingClientRect().width / 50;
    el.removeChild(span);
  }

  const metrics = {
    aspect: cellWidth / lineHeight,
    cellWidth,
    lineHeight,
    fontFamily,
    fontSize,
  };

  return metrics;
}

const defaultSettings: AsciiRendererSettings = {
  cols: 0, // number of columns, 0 is equivalent to 'auto'
  rows: 0, // number of columns, 0 is equivalent to 'auto'
  once: false, // if set to true the renderer will run only once
  fps: 30, // fps capping
  renderer: "text", // can be 'canvas', anything else falls back to 'text'
  allowSelect: false, // allows selection of the rendered element
};

// CSS styles which can be passed to the container element via settings
const CSSStyles: (keyof CSSStyleDeclaration)[] = [
  "backgroundColor",
  "color",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
  "textAlign",
];

const emptyUserData: Record<string, unknown> = {};

interface SessionSettings extends AsciiRendererSettings {
  element: HTMLPreElement | HTMLCanvasElement;
}

// Everything that lives from (re)start to teardown. Pausing keeps it intact.
interface Session {
  element: HTMLPreElement | HTMLCanvasElement;
  settings: SessionSettings;
  renderer: TextRenderer | CanvasRenderer;
  metrics: AsciiMetrics | null;
  buffer: AsciiBuffer[];
  state: ProgramState;
  fps: FPS;
  frameCap: ReturnType<typeof createFrameCap>;
  booted: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Compares settings two levels deep, so inline objects such as
// `intersection` or `canvasSize` don't count as changes.
function settingsEqual(a: object, b: object, depth = 2): boolean {
  if (a === b) return true;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    const va = (a as Record<string, unknown>)[k];
    const vb = (b as Record<string, unknown>)[k];
    if (Object.is(va, vb)) continue;
    if (depth > 1 && isPlainObject(va) && isPlainObject(vb) && settingsEqual(va, vb, depth - 1)) continue;
    return false;
  }
  return true;
}

function getContext(session: Session): AsciiRendererContext | null {
  const metrics = session.metrics;
  if (!metrics) return null;

  const rect = session.element.getBoundingClientRect();
  const cols = session.settings.cols || Math.floor(rect.width / metrics.cellWidth);
  const rows = session.settings.rows || Math.floor(rect.height / metrics.lineHeight);

  return {
    frame: session.state.frame,
    time: session.state.time,
    cols,
    rows,
    metrics,
    width: rect.width,
    height: rect.height,
    settings: session.settings,
    runtime: {
      cycle: session.state.cycle,
      fps: session.fps.fps,
    },
  };
}

function getCursor(
  context: AsciiRendererContext,
  pointer: AsciiRendererCursor
): AsciiRendererCursor {
  const { cellWidth, lineHeight } = context.metrics;
  return {
    x: Math.min(context.cols - 1, pointer.x / cellWidth || 0),
    y: Math.min(context.rows - 1, pointer.y / lineHeight || 0),
    pressed: pointer.pressed || false,
    p: {
      x: pointer.p?.x ? pointer.p.x / cellWidth : 0,
      y: pointer.p?.y ? pointer.p.y / lineHeight : 0,
      pressed: pointer.p?.pressed || false,
    },
  };
}

function createBuffer(length: number, settings: AsciiRendererSettings): AsciiBuffer[] {
  return Array.from({ length }, () => ({
    char: " ",
    color: settings.color,
    backgroundColor: settings.backgroundColor,
    fontWeight: settings.fontWeight,
  }));
}

interface ReactAsciiPlayProps {
  program: AsciiRendererProgram;
  settings: AsciiRendererSettings;
  className?: string;
  /**
   * Drives frames instead of requestAnimationFrame. Called with the frame
   * callback each time the loop starts (mount, restart, resume); may return a
   * function that unsubscribes that callback. Pass a stable function: a new
   * identity restarts the program.
   * @param callback - Function that receives the current timestamp in milliseconds
   */
  loop?: (callback: AnimationCallback) => void | (() => void);
  /**
   * User data to pass to the program
   */
  userData?: Record<string, unknown>;
}

export function ReactAsciiPlay({
  program,
  settings,
  className,
  loop,
  userData = emptyUserData,
}: ReactAsciiPlayProps) {
  const rendererElementRef = useRef<HTMLPreElement | HTMLCanvasElement | null>(
    null
  );
  const intersectionObs = useIntersection(
    rendererElementRef as RefObject<HTMLElement>,
    {
      threshold: settings.intersection?.threshold || 0.2,
      root: settings.intersection?.root || null,
      rootMargin: settings.intersection?.rootMargin || "0px",
    }
  );
  const [pageVisible, setPageVisible] = useState(true);
  const inView = intersectionObs ? intersectionObs.isIntersecting : true;
  const running = pageVisible && inView;

  // Keep the previous settings object while the new one is equal, so inline
  // settings don't restart the program on every parent render.
  const [stableSettings, setStableSettings] = useState(settings);
  if (stableSettings !== settings && !settingsEqual(stableSettings, settings)) {
    setStableSettings(settings);
  }

  const mergedSettings: AsciiRendererSettings = useMemo(
    () => ({ ...defaultSettings, ...stableSettings }),
    [stableSettings]
  );

  const sessionRef = useRef<Session | null>(null);
  const userDataRef = useRef<Record<string, unknown>>(userData);
  const pointerRef = useRef<AsciiRendererCursor>({
    x: 0,
    y: 0,
    pressed: false,
    p: {
      x: 0,
      y: 0,
      pressed: false,
    },
  });

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = document.visibilityState !== "hidden";
      if (!visible) pointerRef.current.pressed = false;
      setPageVisible(visible);
    };
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange, {
      passive: true,
    });
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!inView) pointerRef.current.pressed = false;
  }, [inView]);

  // Session: created on mount and whenever program, settings or loop change.
  // Owns the renderer, buffer and program state, and runs boot.
  useEffect(() => {
    const element = rendererElementRef.current;
    if (!element) return;

    for (const s of CSSStyles) {
      if (mergedSettings[s as keyof AsciiRendererSettings])
        // @ts-expect-error - TODO: check
        element.style[s] = mergedSettings[s as keyof AsciiRendererSettings];
    }

    if (!mergedSettings.allowSelect) {
      element.style.userSelect = "none";
      element.style.webkitUserSelect = "none";
    }

    const session: Session = {
      element,
      settings: { ...mergedSettings, element },
      renderer:
        mergedSettings.renderer === "canvas"
          ? createCanvasRenderer()
          : createTextRenderer(),
      metrics: calcMetrics(element),
      buffer: [],
      state: { time: 0, frame: 0, cycle: 0 },
      fps: new FPS(),
      frameCap: createFrameCap(mergedSettings.fps!),
      booted: false,
    };
    sessionRef.current = session;

    const context = getContext(session);
    if (context) {
      session.buffer = createBuffer(context.cols * context.rows, session.settings);
      session.booted = true;
      program.boot?.(context, session.buffer, userDataRef.current);
    }

    const onResize = () => {
      session.metrics = calcMetrics(element);
    };

    type PointerHandlerName = "pointerMove" | "pointerDown" | "pointerUp";
    const callProgram = (name: PointerHandlerName | "keyDown", event: Event) => {
      const handler = program[name];
      if (!handler) return;
      const context = getContext(session);
      if (!context) return;
      const cursor = getCursor(context, pointerRef.current);
      (handler as (...args: unknown[]) => void)(
        context,
        cursor,
        session.buffer,
        userDataRef.current,
        event
      );
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointerRef.current = {
        ...pointerRef.current,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      callProgram("pointerMove", e);
    };
    const onPointerDown = (e: PointerEvent) => {
      pointerRef.current.pressed = true;
      callProgram("pointerDown", e);
    };
    const onPointerUp = (e: PointerEvent) => {
      pointerRef.current.pressed = false;
      callProgram("pointerUp", e);
    };
    const onKeyDown = (e: KeyboardEvent) => callProgram("keyDown", e);

    // The pre/canvas union loses addEventListener's typed event map.
    const target: HTMLElement = element;
    window.addEventListener("resize", onResize, { passive: true });
    target.addEventListener("pointermove", onPointerMove, { passive: true });
    target.addEventListener("pointerdown", onPointerDown, { passive: true });
    target.addEventListener("pointerup", onPointerUp, { passive: true });
    target.addEventListener("keydown", onKeyDown, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerdown", onPointerDown);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("keydown", onKeyDown);
      session.renderer.dispose();
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, [program, mergedSettings, loop]);

  // Run: drives frames while the session exists and the element is visible.
  useEffect(() => {
    const session = sessionRef.current;
    if (!session || !running) return;

    // Callbacks retained by an external loop must stop once this run ends.
    const run = { active: true };
    let rafId = 0;
    const useExternalLoop = typeof loop === "function" && !session.settings.once;

    session.frameCap.reset();

    const scheduleNext = () => {
      if (!session.settings.once && !useExternalLoop) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = (time: number) => {
      if (!run.active) return;

      if (!session.frameCap.shouldRender(time)) {
        scheduleNext();
        return;
      }

      session.fps.update(time);

      // The context is built before the state update, so programs see the
      // previous frame's time and count.
      const context = getContext(session);
      if (!context) {
        // Nothing rendered yet: retry next frame, even when running once.
        if (!useExternalLoop) rafId = requestAnimationFrame(animate);
        return;
      }

      const length = context.cols * context.rows;
      if (session.buffer.length !== length) {
        session.buffer = createBuffer(length, session.settings);
      }
      if (!session.booted) {
        session.booted = true;
        program.boot?.(context, session.buffer, userDataRef.current);
      }

      const cursor = getCursor(context, pointerRef.current);
      const buffer = session.buffer;
      const userData = userDataRef.current;

      session.state = {
        time,
        frame: session.state.frame + 1,
        cycle: session.state.cycle,
      };

      if (program.pre) {
        program.pre(context, cursor, buffer, userData);
      }

      if (program.main) {
        for (let j = 0; j < context.rows; j++) {
          const offs = j * context.cols;
          for (let i = 0; i < context.cols; i++) {
            const idx = i + offs;
            let out: string | AsciiBuffer | void | undefined = undefined;
            out = program.main(
              { x: i, y: j, index: idx },
              context,
              cursor,
              buffer,
              userData
            );
            if (typeof out === "object" && out !== null) {
              buffer[idx] = { ...buffer[idx], ...out };
            } else if (typeof out === "string" || typeof out === "undefined") {
              buffer[idx] = {
                ...buffer[idx],
                char: (out as string) || " ",
              };
            }
          }
        }
      }

      if (program.post) {
        program.post(context, cursor, buffer, userData);
      }

      session.renderer.render(context, buffer, session.settings);

      scheduleNext();
    };

    let unsubscribe: void | (() => void);
    if (useExternalLoop) {
      unsubscribe = loop(animate);
    } else {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      run.active = false;
      cancelAnimationFrame(rafId);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [program, mergedSettings, loop, running]);

  return (
    <RendererElement
      className={className}
      renderer={mergedSettings.renderer || "text"}
      ref={rendererElementRef}
    />
  );
}

const RendererElement: React.FC<RendererElementProps> = ({
  renderer,
  ref,
  className,
}) => {
  const Element = renderer === "canvas" ? "canvas" : "pre";

  return (
    <Element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    />
  );
};
