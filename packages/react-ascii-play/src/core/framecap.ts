// Decides which animation frames render under an fps cap. Frames are due on a
// fixed schedule (next += interval) rather than relative to the last rendered
// frame, so timestamp jitter can neither drop frames when fps matches the
// display rate nor let renders exceed the cap. The small tolerance absorbs
// jitter; a frame more than one interval late resyncs the schedule.
export function createFrameCap(fps: number) {
  const interval = 1000 / fps;
  const tolerance = Math.min(1, interval / 4);
  let next = -Infinity;

  return {
    shouldRender(time: number) {
      if (time < next - tolerance) return false;
      next = next === -Infinity ? time + interval : next + interval;
      if (time - next >= interval) next = time + interval;
      return true;
    },
    reset() {
      next = -Infinity;
    },
  };
}
