// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

/**
@author ertdfgcvb
@title  Wireframe cube
@desc   The cursor controls box thickness and exp
*/

import { AsciiRendererProgram } from "react-ascii-play";
import { mapNum } from "react-ascii-play/modules/num";
import { drawInfo } from "react-ascii-play/modules/drawbox";
import { createVec3, rotXVec3, rotYVec3, rotZVec3 } from "react-ascii-play/modules/vec3";
import { createVec2 } from "react-ascii-play/modules/vec2";

export const settings = { fps: 60 };

const density = " -=+abcdX";

const { sin, floor, abs, exp, min, sqrt } = Math;

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

    vertices.push(createVec3(x, y, z));

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

const boxProj = vertices.map(() => createVec2(0, 0));

// Per-frame edge data, so the per-cell loop only does what depends on the cell.
// Same arithmetic as sdSegment, split at the point where it stops depending on p.
const edgeCount = edges.length;
const edgeAx = new Float64Array(edgeCount);
const edgeAy = new Float64Array(edgeCount);
const edgeBax = new Float64Array(edgeCount);
const edgeBay = new Float64Array(edgeCount);
const edgeBaba = new Float64Array(edgeCount);

// The vec3 rotations read their input after writing their output, so they
// can't run in place: alternate between two scratch vectors.
const scratchA = createVec3(0, 0, 0);
const scratchB = createVec3(0, 0, 0);

const bgMatrixDim = createVec2(bgMatrix[0].length, bgMatrix.length);

// Distance to the nearest edge minus thickness. Taking the square root once,
// after the min, gives the same value as min over sqrt: sqrt and the
// subtraction are monotonic, and Math.min still propagates NaN.
export function torusDistance(stx: number, sty: number, thickness: number) {
  let dd = Infinity;
  for (let i = 0; i < edgeCount; i++) {
    const pax = stx - edgeAx[i];
    const pay = sty - edgeAy[i];
    const bax = edgeBax[i];
    const bay = edgeBay[i];
    let h = (pax * bax + pay * bay) / edgeBaba[i];
    if (h < 0.0) h = 0.0;
    else if (h > 1.0) h = 1.0;
    const dx = pax - bax * h;
    const dy = pay - bay * h;
    dd = min(dd, dx * dx + dy * dy);
  }
  return min(1e10, sqrt(dd) - thickness);
}

const torusProgram: AsciiRendererProgram = {
  pre(context) {
    const t = context.time * 0.01;
    const rot = createVec3(t * 0.11, t * 0.13, -t * 0.15);
    const d = 2;
    const zOffs = mapNum(sin(t * 0.12), -1, 1, -2.5, -6);
    for (let i = 0; i < torus.vertices.length; i++) {
      rotXVec3(torus.vertices[i], rot.x, scratchA);
      rotYVec3(scratchA, rot.y, scratchB);
      const vt = rotZVec3(scratchB, rot.z, scratchA);
      const k = d / (vt.z - zOffs);
      boxProj[i].x = vt.x * k;
      boxProj[i].y = vt.y * k;
    }
    for (let i = 0; i < edgeCount; i++) {
      const a = boxProj[torus.edges[i][0]];
      const b = boxProj[torus.edges[i][1]];
      const bax = b.x - a.x;
      const bay = b.y - a.y;
      edgeAx[i] = a.x;
      edgeAy[i] = a.y;
      edgeBax[i] = bax;
      edgeBay[i] = bay;
      edgeBaba[i] = bax * bax + bay * bay;
    }
  },
  main(coord, context, cursor) {
    const m = min(context.cols, context.rows);
    const a = context.metrics.aspect;

    const stx = ((2.0 * (coord.x - context.cols / 2 + 0.5)) / m) * a;
    const sty = (2.0 * (coord.y - context.rows / 2 + 0.5)) / m;

    const thickness = mapNum(cursor.x, 0, context.cols, 0.001, 0.1);
    const expMul = mapNum(cursor.y, 0, context.rows, -100, -5);
    const d = torusDistance(stx, sty, thickness);

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
