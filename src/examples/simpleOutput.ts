import { PlaygroundProgram } from "../types/playground";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.:!?";

const simpleOutput: PlaygroundProgram = {
  settings: {
    fps: 30,
    fontFamily: "Simple Console, monospace",
    fontSize: "16px",
    color: "#fff",
  },
  main: (cell, context) => {
    const { x, y } = cell;
    const f = context.frame;
    const l = chars.length;
    const c = context.cols;
    return y % 2 ? chars[(y + x + f) % l] : chars[(y + c - x + f) % l];
  },
};

export default simpleOutput;
