import { useState } from "react";

interface RendererElementProps {
  renderer: "text" | "canvas";
  settings?: PlayCoreAsciiSettings;
  className?: string;
  ref?: React.RefObject<HTMLPreElement | HTMLCanvasElement | null>;
}

import { useEffect, useRef, useCallback, useMemo } from "react";
import { textRenderer, canvasRenderer, FPS } from "@react-play.core/core";
import type {
  PlayCoreAsciiSettings,
  PlayCoreAsciiProgram,
  PlayCoreAsciiContext,
  PlayCoreAsciiCursor,
  PlayCoreAsciiBuffer,
  PlayCoreAsciiMetrics,
  PlayCoreState,
} from "@react-play.core/core";
import React from "react";

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

const defaultSettings: PlayCoreAsciiSettings = {
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

interface PlayCoreAsciiProps {
  program: PlayCoreAsciiProgram;
  settings: PlayCoreAsciiSettings;
  className?: string;
  // delegate frameloop to the parent
  loop?: (callback: (time: number) => void) => void;
}

export function PlayCoreAscii({
  program,
  settings,
  className,
  loop,
}: PlayCoreAsciiProps) {
  const [rendererReady, setRendererReady] = useState(false);
  const rendererElementRef = useRef<HTMLPreElement | HTMLCanvasElement | null>(
    null
  );
  const rendererRef = useRef<typeof textRenderer | typeof canvasRenderer>(null);
  const bufferRef = useRef<PlayCoreAsciiBuffer[]>([]);
  const frameRef = useRef<number[]>([]);
  const metricsRef = useRef<PlayCoreAsciiMetrics | null>(null);
  const contextRef = useRef<PlayCoreAsciiContext | null>(null);
  const fpsRef = useRef(new FPS());
  const stateRef = useRef<PlayCoreState>({
    time: 0,
    frame: 0,
    cycle: 0,
  });

  const pointerRef = useRef({
    x: 0,
    y: 0,
    pressed: false,
    px: 0,
    py: 0,
    ppressed: false,
  });

  // Merge settings with defaults
  const mergedSettings: PlayCoreAsciiSettings = useMemo(
    () => ({
      ...defaultSettings,
      ...settings,
      element: rendererElementRef.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, rendererReady]
  );

  // Get current context
  const getContext = useCallback((): PlayCoreAsciiContext | null => {
    if (!rendererElementRef.current || !metricsRef.current) return null;

    const rect = rendererElementRef.current.getBoundingClientRect();
    const cols =
      mergedSettings.cols ||
      Math.floor(rect.width / metricsRef.current.cellWidth);
    const rows =
      mergedSettings.rows ||
      Math.floor(rect.height / metricsRef.current.lineHeight);

    return {
      frame: stateRef.current.frame,
      time: stateRef.current.time,
      cols,
      rows,
      metrics: metricsRef.current,
      width: rect.width,
      height: rect.height,
      settings: mergedSettings,
      runtime: {
        cycle: stateRef.current.cycle,
        fps: fpsRef.current.fps,
      },
    };
  }, [mergedSettings]);

  // Get current cursor
  const getCursor = useCallback((): PlayCoreAsciiCursor | null => {
    const context = getContext();
    if (!context || !metricsRef.current) return null;

    return {
      x: Math.min(
        context.cols - 1,
        pointerRef.current.x / metricsRef.current.cellWidth
      ),
      y: Math.min(
        context.rows - 1,
        pointerRef.current.y / metricsRef.current.lineHeight
      ),
      pressed: pointerRef.current.pressed,
      p: {
        x: pointerRef.current.px / metricsRef.current.cellWidth,
        y: pointerRef.current.py / metricsRef.current.lineHeight,
        pressed: pointerRef.current.ppressed,
      },
    };
  }, [getContext]);

  // Handle pointer events
  const handlePointerMove = useCallback(
    (_e: PointerEvent) => {
      if (!rendererElementRef.current) return;

      const rect = rendererElementRef.current.getBoundingClientRect();
      pointerRef.current = {
        ...pointerRef.current,
        x: _e.clientX - rect.left,
        y: _e.clientY - rect.top,
        px: pointerRef.current.x,
        py: pointerRef.current.y,
      };

      if (program.pointerMove) {
        const context = getContext();
        const cursor = getCursor();
        if (context && cursor) {
          program.pointerMove(context, cursor, bufferRef.current);
        }
      }
    },
    [program, getContext, getCursor]
  ) as EventListener;

  const handlePointerDown = useCallback(() => {
    pointerRef.current.pressed = true;

    if (program.pointerDown) {
      const context = getContext();
      const cursor = getCursor();
      if (context && cursor) {
        program.pointerDown(context, cursor, bufferRef.current);
      }
    }
  }, [program, getContext, getCursor]) as EventListener;

  const handlePointerUp = useCallback(() => {
    pointerRef.current.pressed = false;

    if (program.pointerUp) {
      const context = getContext();
      const cursor = getCursor();
      if (context && cursor) {
        program.pointerUp(context, cursor, bufferRef.current);
      }
    }
  }, [program, getContext, getCursor]) as EventListener;

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden") {
      pointerRef.current.pressed = false;
      setRendererReady(false);
    } else {
      setRendererReady(true);
    }
  }, []) as EventListener;

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
      if (mergedSettings[s as keyof PlayCoreAsciiSettings])
        // @ts-expect-error - TODO: check
        rendererElement.style[s] =
          mergedSettings[s as keyof PlayCoreAsciiSettings];
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
        program.boot(context, bufferRef.current, {});
      }
    }

    // Animation frame
    let lastTime = 0;
    const interval = 1000 / mergedSettings.fps!;

    const animate = (time: number) => {
      const delta = time - lastTime;
      if (delta < interval) {
        if (!mergedSettings.once) {
          if (typeof loop === "function") {
            loop(animate);
          } else {
            frameRef.current.push(requestAnimationFrame(animate));
          }
        }
        return;
      }

      const context = getContext();
      const cursor = getCursor();

      fpsRef.current.update(time);

      if (!context || !cursor) return;

      // Update state
      stateRef.current = {
        time,
        frame: stateRef.current.frame + 1,
        cycle: stateRef.current.cycle,
      };

      // Run program steps
      if (program.pre) {
        program.pre(context, cursor, bufferRef.current, {});
      }

      if (program.main) {
        for (let j = 0; j < context.rows; j++) {
          const offs = j * context.cols;
          for (let i = 0; i < context.cols; i++) {
            const idx = i + offs;
            let out: string | PlayCoreAsciiBuffer | void | undefined =
              undefined;
            out = program.main(
              { x: i, y: j, index: idx },
              context,
              cursor,
              bufferRef.current,
              {}
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
        program.post(context, cursor, bufferRef.current, {});
      }

      // Render
      if (rendererRef.current) {
        rendererRef.current.render(context, bufferRef.current, mergedSettings);
      }

      lastTime = time - (delta % interval);
      if (!mergedSettings.once) {
        if (typeof loop === "function") {
          loop(animate);
        } else {
          frameRef.current.push(requestAnimationFrame(animate));
        }
      }
    };

    if (typeof loop === "function") {
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
      }
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
