/**
@module   canvasrenderer.js
@desc     renders to canvas
@category renderer
*/

// Each instance owns its cached state (context, last size, glyph widths),
// so several canvases can render without invalidating each other.
export function createCanvasRenderer() {
	let ctx = null
	let ctxCanvas = null
	// Last values assigned to the canvas: assigning width/height truncates
	// fractions, so comparing against canvas.width would resize every frame.
	let lastWidth = -1
	let lastHeight = -1
	let lastStyleWidth = null
	let lastStyleHeight = null
	const widthCache = new Map()
	let widthCacheFont = ''

	// Widths measured while a web font is still loading belong to the
	// fallback font; the font string stays the same once it loads.
	const fonts = typeof document !== 'undefined' ? document.fonts : undefined
	const clearWidths = () => widthCache.clear()
	fonts?.addEventListener('loadingdone', clearWidths)

	const measure = (char) => {
		let w = widthCache.get(char)
		if (w === undefined) {
			w = ctx.measureText(char).width
			widthCache.set(char, w)
		}
		return w
	}

	return {
		preferredElementNodeName: 'CANVAS',
		render: (context, buffer, settings) => {
			const canvas = context.settings.element
			if (!(canvas instanceof HTMLCanvasElement)) return

			if (ctxCanvas !== canvas) {
				ctx = canvas.getContext('2d')
				ctxCanvas = canvas
				lastWidth = lastHeight = -1
				lastStyleWidth = lastStyleHeight = null
			}
			if (!ctx) return

			const scale = window.devicePixelRatio || 1
			const { cols, rows } = context
			const metrics = context.metrics

			// Handle canvas size
			let width, height
			if (settings.canvasSize) {
				width = settings.canvasSize.width * scale
				height = settings.canvasSize.height * scale
				const sw = settings.canvasSize.width + 'px'
				const sh = settings.canvasSize.height + 'px'
				if (sw !== lastStyleWidth) canvas.style.width = lastStyleWidth = sw
				if (sh !== lastStyleHeight) canvas.style.height = lastStyleHeight = sh
			} else {
				width = context.width * scale
				height = context.height * scale
			}
			if (width !== lastWidth) canvas.width = lastWidth = width
			if (height !== lastHeight) canvas.height = lastHeight = height

			// Without a resize the canvas is not reset, so clear explicitly:
			// a translucent background must not accumulate across frames.
			const background = settings.backgroundColor || 'white'
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			// A resize would also reset fillStyle to its default. Do it by hand so an
			// invalid background falls back to black, not the last cell's color.
			ctx.fillStyle = '#000000'
			ctx.fillStyle = background
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			let fill = background

			ctx.setTransform(scale, 0, 0, scale, 0, 0)
			ctx.textBaseline = 'top'

			// Handle canvas offset
			if (settings.canvasOffset) {
				const offs = settings.canvasOffset
				const ox = Math.round(offs.x === 'auto' ? (canvas.width / scale - cols * metrics.cellWidth) / 2 : offs.x)
				const oy = Math.round(offs.y === 'auto' ? (canvas.height / scale - rows * metrics.lineHeight) / 2 : offs.y)
				ctx.translate(ox, oy)
			}

			const fontWeight = settings.fontWeight || '400'
			const fontString = `${fontWeight} ${metrics.fontSize}px ${metrics.fontFamily}`
			ctx.font = fontString

			const cellWidth = metrics.cellWidth
			const lineHeight = metrics.lineHeight
			const defaultColor = settings.color || 'black'

			if (settings.textAlign === 'center') {
				if (fontString !== widthCacheFont) {
					widthCache.clear()
					widthCacheFont = fontString
				}
				const rowWidth = canvas.width / scale
				for (let y = 0; y < rows; y++) {
					const offs = y * cols
					let totalWidth = 0
					for (let x = 0; x < cols; x++) {
						totalWidth += measure(buffer[offs + x].char)
					}

					let xOffset = (rowWidth - totalWidth) * 0.5
					const yPos = y * lineHeight

					for (let x = 0; x < cols; x++) {
						const cell = buffer[offs + x]
						const char = cell.char
						const w = measure(char)
						if (cell.backgroundColor && cell.backgroundColor !== settings.backgroundColor) {
							if (fill !== cell.backgroundColor) ctx.fillStyle = fill = cell.backgroundColor
							ctx.fillRect(Math.round(xOffset), yPos, Math.ceil(w), lineHeight)
						}
						const color = cell.color || defaultColor
						if (fill !== color) ctx.fillStyle = fill = color
						if (char !== ' ' && char !== '') ctx.fillText(char, xOffset, yPos)
						xOffset += w
					}
				}
			} else {
				// Default left-aligned rendering
				const bgWidth = Math.ceil(cellWidth)
				for (let y = 0; y < rows; y++) {
					const offs = y * cols
					const yPos = y * lineHeight
					for (let x = 0; x < cols; x++) {
						const cell = buffer[offs + x]
						const xPos = x * cellWidth

						if (cell.backgroundColor && cell.backgroundColor !== settings.backgroundColor) {
							if (fill !== cell.backgroundColor) ctx.fillStyle = fill = cell.backgroundColor
							ctx.fillRect(Math.round(xPos), yPos, bgWidth, lineHeight)
						}
						// Whitespace still sets the fill: an invalid color on a later cell
						// leaves fillStyle unchanged, so it inherits this one.
						const color = cell.color || defaultColor
						if (fill !== color) ctx.fillStyle = fill = color
						const char = cell.char
						if (char !== ' ' && char !== '') ctx.fillText(char, xPos, yPos)
					}
				}
			}
		},
		dispose: () => {
			fonts?.removeEventListener('loadingdone', clearWidths)
			widthCache.clear()
			ctx = null
			ctxCanvas = null
		},
	}
}
