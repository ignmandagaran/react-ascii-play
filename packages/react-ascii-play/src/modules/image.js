/**
@module   image.cjs
@desc     Image loader and helper
@category public

Loads an image and draws it on a canvas.
The returned object is a canvas wrapper and its methods (get, sample, etc.)
can be used before the image has completely loaded.

Usage:
// Starts async loading:
const img = Image.load('res/pattern.png')
// Returns a black color until the image has been loaded:
const color = img.get(10, 10)

*/

/* eslint-env browser */
/* global document, console */

import Canvas from "./canvas.js";
import { loadImage } from "./load.js";

export function drawImageOnCanvas(path) {
  const source = document.createElement("canvas");
  source.width = 1;
  source.height = 1;

  const canvas = new Canvas(source);

  loadImage(path)
    .then((img) => {
      console.log(
        "Image " + path + " loaded. Size: " + img.width + "×" + img.height
      );
      canvas.resize(img.width, img.height);
      canvas.copy(img);
    })
    .catch(() => {
      console.warn("There was an error loading image " + path + ".");
    });

  return canvas;
}
