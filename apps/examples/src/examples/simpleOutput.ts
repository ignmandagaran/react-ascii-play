import { PlayCoreAsciiProgram } from "@react-play.core/core";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.:!?";

const simpleOutput: PlayCoreAsciiProgram = {
  main: (cell, context) => {
    const { x, y } = cell;
    const f = context.frame;
    const l = chars.length;
    const c = context.cols;
    return y % 2 ? chars[(y + x + f) % l] : chars[(y + c - x + f) % l];
  },
};

export default simpleOutput;
