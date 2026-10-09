// Controllable browser pieces happy-dom doesn't model the way the component
// needs: animation frames, intersection, layout sizes and page visibility.

type FrameCallback = (time: number) => void;

let frameQueue = new Map<number, FrameCallback>();
let nextFrameId = 1;
let now = 0;

export function installAnimationFrames() {
  frameQueue = new Map();
  now = 0;
  globalThis.requestAnimationFrame = ((cb: FrameCallback) => {
    const id = nextFrameId++;
    frameQueue.set(id, cb);
    return id;
  }) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = (id: number) => {
    frameQueue.delete(id);
  };
}

/** Runs `count` animation frames, `step` ms apart. */
export function runFrames(count: number, step = 1000 / 60) {
  for (let i = 0; i < count; i++) {
    now += step;
    const callbacks = [...frameQueue.values()];
    frameQueue.clear();
    for (const cb of callbacks) cb(now);
  }
}

export const pendingFrames = () => frameQueue.size;
export const currentTime = () => now;

interface FakeObserver {
  callback: IntersectionObserverCallback;
  targets: Element[];
}
const observers: FakeObserver[] = [];
let intersecting = true;

export function installIntersectionObserver() {
  observers.length = 0;
  intersecting = true;
  globalThis.IntersectionObserver = class {
    private entry: FakeObserver;
    constructor(callback: IntersectionObserverCallback) {
      this.entry = { callback, targets: [] };
      observers.push(this.entry);
    }
    observe(target: Element) {
      this.entry.targets.push(target);
      // Real observers report the current state once observation starts.
      this.entry.callback([{ target, isIntersecting: intersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    unobserve() {}
    disconnect() {
      this.entry.targets = [];
    }
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

export function setIntersecting(isIntersecting: boolean) {
  intersecting = isIntersecting;
  for (const o of observers) {
    if (o.targets.length === 0) continue;
    const entries = o.targets.map((target) => ({ target, isIntersecting }) as IntersectionObserverEntry);
    o.callback(entries, {} as IntersectionObserver);
  }
}

/**
 * Elements report `width` x `height`; spans (used to measure a character
 * cell) report 50 cells of `cellWidth`.
 */
export function installLayout(width: number, height: number, cellWidth: number) {
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const w = this.tagName === "SPAN" ? cellWidth * 50 : width;
    const h = this.tagName === "SPAN" ? 0 : height;
    return { x: 0, y: 0, left: 0, top: 0, right: w, bottom: h, width: w, height: h, toJSON() {} } as DOMRect;
  };
}

export function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
  document.dispatchEvent(new Event("visibilitychange"));
}
