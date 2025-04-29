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
import { useEffect, useRef, useCallback, useMemo } from "react";
import textRenderer from "./core/textrenderer";
import canvasRenderer from "./core/canvasrenderer";
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

interface ReactAsciiPlayProps {
  program: AsciiRendererProgram;
  settings: AsciiRendererSettings;
  className?: string;
  /**
   * @param callback - Function that receives the current timestamp in milliseconds
   */
  loop?: (callback: AnimationCallback) => void;
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
  userData = {},
}: ReactAsciiPlayProps) {
  const [rendererReady, setRendererReady] = useState(false);
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
  const rendererRef = useRef<typeof textRenderer | typeof canvasRenderer>(null);
  const bufferRef = useRef<AsciiBuffer[]>([]);
  const frameRef = useRef<number[]>([]);
  const metricsRef = useRef<AsciiMetrics | null>(null);
  const contextRef = useRef<AsciiRendererContext | null>(null);
  const fpsRef = useRef<FPS | null>(null);
  const stateRef = useRef<ProgramState | null>({
    time: 0,
    frame: 0,
    cycle: 0,
  });

  const pointerRef = useRef<AsciiRendererCursor | null>({
    x: 0,
    y: 0,
    pressed: false,
    p: {
      x: 0,
      y: 0,
      pressed: false,
    },
  });

  // Merge settings with defaults
  const mergedSettings: AsciiRendererSettings = useMemo(
    () => ({
      ...defaultSettings,
      ...settings,
      element: rendererElementRef.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, rendererReady]
  );

  // User data
  const userDataRef = useRef<Record<string, unknown>>({});

  // Get current context
  const getContext = useCallback((): AsciiRendererContext | null => {
    if (!rendererElementRef.current || !metricsRef.current) return null;

    const rect = rendererElementRef.current.getBoundingClientRect();
    const cols =
      mergedSettings.cols ||
      Math.floor(rect.width / metricsRef.current.cellWidth);
    const rows =
      mergedSettings.rows ||
      Math.floor(rect.height / metricsRef.current.lineHeight);

    return {
      frame: stateRef.current?.frame || 0,
      time: stateRef.current?.time || 0,
      cols,
      rows,
      metrics: metricsRef.current,
      width: rect.width,
      height: rect.height,
      settings: mergedSettings,
      runtime: {
        cycle: stateRef.current?.cycle || 0,
        fps: fpsRef.current?.fps || 0,
      },
    };
  }, [mergedSettings]);

  // Get current cursor
  const getCursor = useCallback((): AsciiRendererCursor | null => {
    const context = getContext();
    if (!context || !metricsRef.current) return null;

    if (!pointerRef.current) {
      pointerRef.current = {
        x: 0,
        y: 0,
        pressed: false,
        p: {
          x: 0,
          y: 0,
          pressed: false,
        },
      };
    }

    return {
      x: Math.min(
        context.cols - 1,
        pointerRef.current.x / metricsRef.current.cellWidth || 0
      ),
      y: Math.min(
        context.rows - 1,
        pointerRef.current.y / metricsRef.current.lineHeight || 0
      ),
      pressed: pointerRef.current.pressed || false,
      p: {
        x: pointerRef.current.p?.x
          ? pointerRef.current.p.x / metricsRef.current.cellWidth
          : 0,
        y: pointerRef.current.p?.y
          ? pointerRef.current.p.y / metricsRef.current.lineHeight
          : 0,
        pressed: pointerRef.current.p?.pressed || false,
      },
    };
  }, [getContext]);

  // Handle pointer events
  const handlePointerMove = useCallback(
    (_e: PointerEvent) => {
      if (!rendererElementRef.current || !pointerRef.current) return;

      const rect = rendererElementRef.current.getBoundingClientRect();
      pointerRef.current = {
        ...pointerRef.current,
        x: _e.clientX - rect.left,
        y: _e.clientY - rect.top,
      };

      if (program.pointerMove) {
        const context = getContext();
        const cursor = getCursor();
        if (context && cursor) {
          program.pointerMove(
            context,
            cursor,
            bufferRef.current,
            userDataRef.current,
            _e
          );
        }
      }
    },
    [program, getContext, getCursor]
  ) as EventListener;

  const handlePointerDown = useCallback(
    (_e: PointerEvent) => {
      if (!pointerRef.current) return;
      pointerRef.current.pressed = true;

      if (program.pointerDown) {
        const context = getContext();
        const cursor = getCursor();
        if (context && cursor) {
          program.pointerDown(
            context,
            cursor,
            bufferRef.current,
            userDataRef.current,
            _e
          );
        }
      }
    },
    [program, getContext, getCursor]
  ) as EventListener;

  const handlePointerUp = useCallback(
    (_e: PointerEvent) => {
      if (!pointerRef.current) return;
      pointerRef.current.pressed = false;

      if (program.pointerUp) {
        const context = getContext();
        const cursor = getCursor();
        if (context && cursor) {
          program.pointerUp(
            context,
            cursor,
            bufferRef.current,
            userDataRef.current,
            _e
          );
        }
      }
    },
    [program, getContext, getCursor]
  ) as EventListener;

  const handleKeyDown = useCallback(
    (_e: KeyboardEvent) => {
      if (program.keyDown) {
        const context = getContext();
        const cursor = getCursor();
        if (context && cursor) {
          program.keyDown(
            context,
            cursor,
            bufferRef.current,
            userDataRef.current,
            _e
          );
        }
      }
    },
    [program, getContext, getCursor]
  ) as EventListener;

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden") {
      if (pointerRef.current) {
        pointerRef.current.pressed = false;
      }
      setRendererReady(false);
    } else {
      setRendererReady(true);
    }
  }, []) as EventListener;

  // Update user data
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  // stop loop when component is not in view
  useEffect(() => {
    if (!intersectionObs) return;
    if (!intersectionObs.isIntersecting) {
      if (pointerRef.current) {
        pointerRef.current.pressed = false;
      }
      setRendererReady(false);
    } else {
      setRendererReady(true);
    }
  }, [intersectionObs]);

  // get context
  useEffect(() => {
    if (!rendererElementRef.current) return;

    const rendererElement = rendererElementRef.current;

    const onResize = () => {
      metricsRef.current = calcMetrics(rendererElement);
    };

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange, {
      passive: true,
    });
    onResize();
    setRendererReady(true);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Animation loop
  useEffect(() => {
    if (!rendererElementRef.current || !rendererReady) return;

    // Renderer element
    const rendererElement = rendererElementRef.current;

    // Initialize renderer
    rendererRef.current =
      mergedSettings.renderer === "canvas" ? canvasRenderer : textRenderer;

    // Apply CSS settings to element
    for (const s of CSSStyles) {
      if (mergedSettings[s as keyof AsciiRendererSettings])
        // @ts-expect-error - TODO: check
        rendererElement.style[s] =
          mergedSettings[s as keyof AsciiRendererSettings];
    }

    // Initialize buffer
    const context = contextRef.current;

    // Calculate initial metrics
    metricsRef.current = calcMetrics(rendererElement);

    if (context) {
      bufferRef.current = new Array(context.cols * context.rows)
        .fill(null)
        .map(() => ({
          char: " ",
          color: mergedSettings.color,
          backgroundColor: mergedSettings.backgroundColor,
          fontWeight: mergedSettings.fontWeight,
        }));
    }

    // Boot program
    if (program.boot) {
      if (context) {
        program.boot(context, bufferRef.current, userDataRef.current);
      }
    }

    // Animation frame
    let lastTime = 0;
    const interval = 1000 / mergedSettings.fps!;

    if (!fpsRef.current) {
      fpsRef.current = new FPS();
    }

    const animate = (time: number) => {
      const delta = time - lastTime;
      if (delta < interval) {
        if (!mergedSettings.once) {
          if (!(typeof loop === "function")) {
            frameRef.current.push(requestAnimationFrame(animate));
          }
        }
        return;
      }

      const context = getContext();
      const cursor = getCursor();

      fpsRef.current?.update(time);

      if (!context || !cursor) return;

      // Update state
      stateRef.current = {
        time,
        frame: (stateRef.current?.frame || 0) + 1,
        cycle: stateRef.current?.cycle || 0,
      };

      // Run program steps
      if (program.pre) {
        program.pre(context, cursor, bufferRef.current, userDataRef.current);
      }

      if (program.main) {
        for (let j = 0; j < context.rows; j++) {
          const offs = j * context.cols;
          for (let i = 0; i < context.cols; i++) {
            const idx = i + offs;
            let out: string | AsciiBuffer | void | undefined =
              undefined;
            out = program.main(
              { x: i, y: j, index: idx },
              context,
              cursor,
              bufferRef.current,
              userDataRef.current
            );
            if (typeof out === "object" && out !== null) {
              bufferRef.current[idx] = { ...bufferRef.current[idx], ...out };
            } else if (typeof out === "string" || typeof out === "undefined") {
              bufferRef.current[idx] = {
                ...bufferRef.current[idx],
                char: (out as string) || " ",
              };
            }
          }
        }
      }

      if (program.post) {
        program.post(context, cursor, bufferRef.current, userDataRef.current);
      }

      // Render
      if (rendererRef.current) {
        rendererRef.current.render(context, bufferRef.current, mergedSettings);
      }

      lastTime = time - (delta % interval);
      if (!mergedSettings.once) {
        if (!(typeof loop === "function")) {
          frameRef.current.push(requestAnimationFrame(animate));
        }
      }
    };

    if (typeof loop === "function" && !mergedSettings.once) {
      loop(animate);
    } else {
      frameRef.current.push(requestAnimationFrame(animate));
    }

    // Add event listeners
    rendererElement.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    rendererElement.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    rendererElement.addEventListener("pointerup", handlePointerUp, {
      passive: true,
    });
    rendererElement.addEventListener("keydown", handleKeyDown, {
      passive: true,
    });

    // Handle text selection
    if (!mergedSettings.allowSelect) {
      rendererElement.style.userSelect = "none";
      rendererElement.style.webkitUserSelect = "none";
      // Use standard userSelect for all browsers
      rendererElement.style.userSelect = "none";
    }

    const cleanupRafs = () => {
      frameRef.current.forEach((id) => cancelAnimationFrame(id));
      frameRef.current = [];
    };

    // Cleanup
    return () => {
      cleanupRafs();
      if (rendererElement) {
        rendererElement.removeEventListener(
          "pointermove",
          handlePointerMove as EventListener
        );
        rendererElement.removeEventListener(
          "pointerdown",
          handlePointerDown as EventListener
        );
        rendererElement.removeEventListener(
          "pointerup",
          handlePointerUp as EventListener
        );
        rendererElement.removeEventListener(
          "keydown",
          handleKeyDown as EventListener
        );
      }

      // clean up refs
      bufferRef.current = [];
      frameRef.current = [];
      metricsRef.current = null;
      contextRef.current = null;
      fpsRef.current = null;
      stateRef.current = null;
      pointerRef.current = null;
      userDataRef.current = {};
    };
  }, [
    program,
    mergedSettings,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    getContext,
    getCursor,
    rendererReady,
    handleVisibilityChange,
    loop,
  ]);

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
