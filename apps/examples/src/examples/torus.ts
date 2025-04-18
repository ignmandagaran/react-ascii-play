// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

/**
@author ertdfgcvb
@title  Wireframe cube
@desc   The cursor controls box thickness and exp
*/

import { sdSegment, vec2, vec3, map, drawInfo } from "@react-play.core/core";

export const settings = { fps: 60 };

const density = " -=+abcdX";

// Shorthands
const { vec3 } = v3;
const { vec2 } = v2;
const { sin, floor, abs, exp, min } = Math;

// Lookup table for the background
const bgMatrix = [
  "┼──────",
  "│      ",
  "│      ",
  "│      ",
  "│      ",
  "│      ",
];

// Torus primitive
const R = 2; // Major radius (distance from center of tube to center of torus)
const r = 0.5; // Minor radius (radius of the tube)
const majorSegments = 12; // number of segments around the major circle
const minorSegments = 8;
const vertices = [];
const edges = [];

for (let i = 0; i < majorSegments; i++) {
  const theta = (i / majorSegments) * 2 * Math.PI;

  for (let j = 0; j < minorSegments; j++) {
    const phi = (j / minorSegments) * 2 * Math.PI;

    const x = (R + r * Math.cos(phi)) * Math.cos(theta);
    const y = (R + r * Math.cos(phi)) * Math.sin(theta);
    const z = r * Math.sin(phi);

    vertices.push(vec3(x, y, z));

    // Connect to next minor segment
    const current = i * minorSegments + j;
    const nextMinor = i * minorSegments + ((j + 1) % minorSegments);
    edges.push([current, nextMinor]);

    // Connect to next major segment
    const nextMajor = ((i + 1) % majorSegments) * minorSegments + j;
    edges.push([current, nextMajor]);
  }
}

const torus = {
  vertices,
  edges,
};

const boxProj = [];

const bgMatrixDim = vec2(bgMatrix[0].length, bgMatrix.length);

const torusProgram = {
  pre(context) {
    const t = context.time * 0.01;
    const rot = vec3(t * 0.11, t * 0.13, -t * 0.15);
    const d = 2;
    const zOffs = map(sin(t * 0.12), -1, 1, -2.5, -6);
    for (let i = 0; i < torus.vertices.length; i++) {
      const v = v3.copy(torus.vertices[i]);
      let vt = v3.rotX(v, rot.x);
      vt = v3.rotY(vt, rot.y);
      vt = v3.rotZ(vt, rot.z);
      boxProj[i] = v2.mulN(vec2(vt.x, vt.y), d / (vt.z - zOffs));
    }
  },
  main(coord, context, cursor) {
    const m = min(context.cols, context.rows);
    const a = context.metrics.aspect;

    const st = {
      x: ((2.0 * (coord.x - context.cols / 2 + 0.5)) / m) * a,
      y: (2.0 * (coord.y - context.rows / 2 + 0.5)) / m,
    };

    let d = 1e10;
    const n = torus.edges.length;
    const thickness = map(cursor.x, 0, context.cols, 0.001, 0.1);
    const expMul = map(cursor.y, 0, context.rows, -100, -5);
    for (let i = 0; i < n; i++) {
      const a = boxProj[torus.edges[i][0]];
      const b = boxProj[torus.edges[i][1]];
      d = min(d, sdSegment(st, a, b, thickness));
    }

    const idx = floor(exp(expMul * abs(d)) * density.length);

    if (idx == 0) {
      const x = coord.x % bgMatrixDim.x;
      const y = coord.y % bgMatrixDim.y;
      return {
        char: d < 0 ? " " : bgMatrix[y][x],
        color: "black",
      };
    } else {
      return {
        char: density[idx],
        color: "royalblue",
      };
    }
  },
  post(context, cursor, buffer) {
    drawInfo(context, cursor, buffer);
  },
};

export default torusProgram;
