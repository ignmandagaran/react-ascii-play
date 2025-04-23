/**
@module   loader.js
@desc     Various file type loader, returns a Promise
@category internal

Example:

import Load from './load.js'

// Usage: load different file types with one callback
Promise.all([
	Load.text('assets/1/text.txt'),
	Load.image('assets/1/blocks.png'),
	Load.image('assets/1/colors.png'),
	Load.json('data.json'),
]).then(function(res) {
	console.log('Everything has loaded!')
	console.log(res)
}).catch(function() {
	console.log('Error')
})

// Usage: load a single resource
Load.image('assets/1/colors.png').then( img => {
	console.log(`Image has loaded, size is: ${img.width}x${img.height}`)
})

*/

/* eslint-env browser */
/* global Image, console, fetch */

export function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.log("Loader: error loading image " + url);
      resolve(null);
    };
    img.src = url;
  });
}

export async function loadText(url) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch {
    console.log("Loader: error loading text " + url);
    return "";
  }
}

export async function loadJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch {
    console.log("Loader: error loading json " + url);
    return {};
  }
}
