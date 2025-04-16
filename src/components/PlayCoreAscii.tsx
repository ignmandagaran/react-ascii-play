import { useState } from "react";

interface RendererElementProps {
  renderer: "text" | "canvas";
  settings?: PlaygroundSettings;
  className?: string;
  ref?: React.RefObject<HTMLPreElement | HTMLCanvasElement>;
}

import { useEffect, useRef, useCallback, useMemo } from "react";
import textRenderer from "../core/textrenderer";
import canvasRenderer from "../core/canvasrenderer";
import {
  PlaygroundSettings,
  PlaygroundProgram,
  PlaygroundContext,
  PlaygroundCursor,
  PlaygroundBuffer,
  PlaygroundMetrics,
} from "../types/playground";
import React from "react";

// Calcs width (fract), height, aspect of a monospaced char
// assuming that the CSS font-family is a monospaced font.
// Returns a mutable object.
export function calcMetrics(el: HTMLPreElement | HTMLCanvasElement) {
  const style = getComputedStyle(el);

  // Extract info from the style: in case of a canvas element
  // the style and font family should be set anyways.
  const fontFamily = style.getPropertyValue("font-family");
  const fontSize = parseFloat(style.getPropertyValue("font-size"));
  // Can’t rely on computed lineHeight since Safari 14.1
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

const defaultSettings: PlaygroundSettings = {
  cols: 0, // number of columns, 0 is equivalent to 'auto'
  rows: 0, // number of columns, 0 is equivalent to 'auto'
  once: false, // if set to true the renderer will run only once
  fps: 30, // fps capping
  renderer: "text", // can be 'canvas', anything else falls back to 'text'
  allowSelect: false, // allows selection of the rendered element
};

interface PlayCoreState {
  time: number;
  frame: number;
  cycle: number;
}

export function PlayCoreAscii({
  program,
  settings,
}: {
  program: PlaygroundProgram;
  settings: PlaygroundSettings;
}) {
  const [rendererElement, setRendererElement] = useState<
    HTMLPreElement | HTMLCanvasElement | null
  >(null);
  const rendererRef = useRef<typeof textRenderer | typeof canvasRenderer>(null);
  const bufferRef = useRef<PlaygroundBuffer[]>([]);
  const frameRef = useRef<number>(0);
  const metricsRef = useRef<PlaygroundMetrics | null>(null);
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
  const mergedSettings: PlaygroundSettings = useMemo(
    () => ({ ...defaultSettings, ...settings, element: rendererElement }),
    [rendererElement, settings]
  );

  // Get current context
  const getContext = useCallback((): PlaygroundContext | null => {
    if (!rendererElement || !metricsRef.current) return null;

    const rect = rendererElement.getBoundingClientRect();
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
        fps: mergedSettings.fps || 30,
      },
    };
  }, [rendererElement, mergedSettings]);

  // Get current cursor
  const getCursor = useCallback((): PlaygroundCursor | null => {
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
      if (!rendererElement) return;

      const rect = rendererElement.getBoundingClientRect();
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
    [program, getContext, rendererElement, getCursor]
  );

  const handlePointerDown = useCallback(() => {
    pointerRef.current.pressed = true;
    pointerRef.current.ppressed = pointerRef.current.pressed;

    if (program.pointerDown) {
      const context = getContext();
      const cursor = getCursor();
      if (context && cursor) {
        program.pointerDown(context, cursor, bufferRef.current);
      }
    }
  }, [program, getContext, getCursor]);

  const handlePointerUp = useCallback(() => {
    pointerRef.current.pressed = false;
    pointerRef.current.ppressed = pointerRef.current.pressed;

    if (program.pointerUp) {
      const context = getContext();
      const cursor = getCursor();
      if (context && cursor) {
        program.pointerUp(context, cursor, bufferRef.current);
      }
    }
  }, [program, getContext, getCursor]);

  // Animation loop
  useEffect(() => {
    if (!rendererElement) return;

    // Initialize renderer
    rendererRef.current =
      mergedSettings.renderer === "canvas" ? canvasRenderer : textRenderer;

    // Calculate initial metrics
    metricsRef.current = calcMetrics(rendererElement);

    // Initialize buffer
    const context = getContext();
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
      const context = getContext();
      if (context) {
        program.boot(context, bufferRef.current, {});
      }
    }

    // Animation frame
    let lastTime = 0;
    const interval = 1000 / (mergedSettings.fps || 30);

    const animate = (time: number) => {
      const delta = time - lastTime;
      if (delta < interval) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const context = getContext();
      const cursor = getCursor();
      if (!context || !cursor) return;

      // Update state
      stateRef.current = {
        time: time + stateRef.current.time,
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
            const out = program.main(
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
                char: out || " ",
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
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

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

    // apply settings to the element
    rendererElement.style.backgroundColor =
      mergedSettings.backgroundColor || "";
    rendererElement.style.color = mergedSettings.color || "";
    rendererElement.style.fontFamily = mergedSettings.fontFamily || "";
    rendererElement.style.fontSize = mergedSettings.fontSize || "";
    rendererElement.style.fontWeight = mergedSettings.fontWeight || "";
    rendererElement.style.letterSpacing = mergedSettings.letterSpacing || "";
    rendererElement.style.lineHeight = mergedSettings.lineHeight || "";
    rendererElement.style.textAlign = mergedSettings.textAlign || "";

    // Handle text selection
    if (!mergedSettings.allowSelect) {
      rendererElement.style.userSelect = "none";
      rendererElement.style.webkitUserSelect = "none";
      // Use standard userSelect for all browsers
      rendererElement.style.userSelect = "none";
    }

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (rendererElement) {
        rendererElement.removeEventListener("pointermove", handlePointerMove);
        rendererElement.removeEventListener("pointerdown", handlePointerDown);
        rendererElement.removeEventListener("pointerup", handlePointerUp);
      }
    };
  }, [
    program,
    mergedSettings,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    rendererElement,
    getContext,
    getCursor,
  ]);

  return (
    <RendererElement
      renderer={mergedSettings.renderer || "text"}
      ref={(r: HTMLPreElement | HTMLCanvasElement | null) => setRendererElement(r)}
    />
  );
}

const RendererElement: React.FC<RendererElementProps> = ({
  renderer,
  ref,
}) => {
  const Element = renderer === "canvas" ? "canvas" : "pre";

  return (
    <Element
      ref={ref as React.RefObject<HTMLPreElement | HTMLCanvasElement>}
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: "1rem",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    />
  );
};
