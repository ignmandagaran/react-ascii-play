/**
@module   canvasrenderer.js
@desc     renders to canvas
@category renderer
*/

const canvasRenderer = {
	preferredElementNodeName: 'CANVAS',
	render: (context, buffer, settings) => {
		const canvas = context.settings.element;
		if (!(canvas instanceof HTMLCanvasElement)) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const scale = window.devicePixelRatio || 1;
		const { cols, rows } = context;

		// Handle canvas size
		if (settings.canvasSize) {
			canvas.width = settings.canvasSize.width * scale;
			canvas.height = settings.canvasSize.height * scale;
			canvas.style.width = settings.canvasSize.width + 'px';
			canvas.style.height = settings.canvasSize.height + 'px';
		} else {
			canvas.width = context.width * scale;
			canvas.height = context.height * scale;
		}

		// Clear and set background
		ctx.fillStyle = settings.backgroundColor || 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Setup text rendering
		ctx.save();
		ctx.scale(scale, scale);
		ctx.textBaseline = 'top';
		
		// Handle canvas offset
		if (settings.canvasOffset) {
			const offs = settings.canvasOffset;
			const ox = Math.round(offs.x === 'auto' ? (canvas.width / scale - cols * context.metrics.cellWidth) / 2 : offs.x);
			const oy = Math.round(offs.y === 'auto' ? (canvas.height / scale - rows * context.metrics.lineHeight) / 2 : offs.y);
			ctx.translate(ox, oy);
		}

		const fontWeight = settings.fontWeight || '400';
		const fontString = `${fontWeight} ${context.metrics.fontSize}px ${context.metrics.fontFamily}`;

		// Center-aligned text rendering
		if (settings.textAlign === 'center') {
			for (let y = 0; y < rows; y++) {
				const rowBuffer = buffer.slice(y * cols, (y + 1) * cols);
				let totalWidth = 0;
				const widths = [];

				// Measure widths
				for (let x = 0; x < cols; x++) {
					const cell = rowBuffer[x];
					ctx.font = fontString;
					const width = ctx.measureText(cell.char).width;
					widths[x] = width;
					totalWidth += width;
				}

				// Render centered row
				let xOffset = (canvas.width / scale - totalWidth) * 0.5;
				const yPos = y * context.metrics.lineHeight;

				for (let x = 0; x < cols; x++) {
					const cell = rowBuffer[x];
					if (cell.backgroundColor && cell.backgroundColor !== settings.backgroundColor) {
						ctx.fillStyle = cell.backgroundColor;
						ctx.fillRect(Math.round(xOffset), yPos, Math.ceil(widths[x]), context.metrics.lineHeight);
					}
					ctx.fillStyle = cell.color || settings.color || 'black';
					ctx.font = fontString;
					ctx.fillText(cell.char, xOffset, yPos);
					xOffset += widths[x];
				}
			}
		} else {
			// Default left-aligned rendering
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					const cell = buffer[y * cols + x];
					const xPos = x * context.metrics.cellWidth;
					const yPos = y * context.metrics.lineHeight;

					if (cell.backgroundColor && cell.backgroundColor !== settings.backgroundColor) {
						ctx.fillStyle = cell.backgroundColor;
						ctx.fillRect(
							Math.round(xPos),
							yPos,
							Math.ceil(context.metrics.cellWidth),
							context.metrics.lineHeight
						);
					}
					ctx.fillStyle = cell.color || settings.color || 'black';
					ctx.font = fontString;
					ctx.fillText(cell.char, xPos, yPos);
				}
			}
		}

		ctx.restore();
	}
};

export default canvasRenderer;
