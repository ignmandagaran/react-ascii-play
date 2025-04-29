import { AsciiRendererProgram } from "react-ascii-play";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.:!?";

const simpleOutput: AsciiRendererProgram = {
  main: (cell, context) => {
    const { x, y } = cell;
    const f = context.frame;
    const l = chars.length;
    const c = context.cols;
    return y % 2 ? chars[(y + x + f) % l] : chars[(y + c - x + f) % l];
  },
};

export default simpleOutput;
