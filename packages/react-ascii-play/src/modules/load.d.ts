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

/** Resolves to the parsed JSON, or `{}` if loading or parsing fails. */
export function loadJson(url: string): Promise<unknown>;
/** Resolves to `null` if the image fails to load. */
export function loadImage(url: string): Promise<HTMLImageElement | null>;
export function loadText(url: string): Promise<string>;
