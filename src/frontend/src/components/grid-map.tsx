import { useCallback, useEffect, useMemo, useRef } from 'react';

type ItemType = 'water' | 'land';

export type GridCell = {
	x: number;
	y: number;
	value: number;
	type: ItemType;
	resources: {
		oil: number | null;
		metal: number | null;
		helium: number | null;
		ship: number | null;
		coral: number | null;
		species: number | null;
		temperature: number | null;
		algal: number | null;
		wind: number | null;
	};
};

/**
 * Component to display a grid map with cells using a canvas element.
 */
export function GridMap(props: {
	width: number;
	height: number;
	focusedCell: GridCell | null;
	onCellFocus: (cell: GridCell | null) => void;
	paths?: {
		firstPath?: Array<{ x: number; y: number }>;
		secondPath?: Array<{ x: number; y: number }>;
	};
	cells: GridCell[][];
	enableOpacity?: boolean;
	className?: string;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const cellSize = useMemo(
		() => Math.min(props.width, props.height) / props.cells.length,
		[props.width, props.height, props.cells.length],
	);

	const drawPaths = useCallback(
		(ctx: CanvasRenderingContext2D, path: Array<Array<{ x: number; y: number }>>) => {
			// Different colors for the paths
			const colors = ['red', 'yellow'];
			path.forEach((p, i) => {
				ctx.strokeStyle = colors[i];
				ctx.beginPath();
				p.forEach((point, index) => {
					if (index === 0) {
						ctx.moveTo(point.x * cellSize + cellSize / 2, point.y * cellSize + cellSize / 2);
					} else {
						ctx.lineTo(point.x * cellSize + cellSize / 2, point.y * cellSize + cellSize / 2);
					}
				});
				ctx.stroke();
			});
		},
		[cellSize],
	);

	const fillCell = useCallback(
		(x: number, y: number, cell: GridCell, ctx: CanvasRenderingContext2D) => {
			ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
			if (props.enableOpacity) ctx.globalAlpha = cell.value;
			ctx.fillStyle = cell.type === 'water' ? 'blue' : 'green';
			ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
			drawPaths(ctx, [props.paths?.firstPath || [], props.paths?.secondPath || []]);
		},
		[cellSize, props.enableOpacity, props.paths, drawPaths],
	);

	const highlightCell = useCallback(
		(x: number, y: number, ctx: CanvasRenderingContext2D) => {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
			drawPaths(ctx, [props.paths?.firstPath || [], props.paths?.secondPath || []]);
		},
		[cellSize, props.paths, drawPaths],
	);

	// Initialize the canvas
	useEffect(() => {
		if (!canvas.current) return;

		const ctx = canvas.current.getContext('2d');

		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
		ctx.imageSmoothingEnabled = false;

		if (!props.enableOpacity) ctx.globalAlpha = 1;

		// Draw the cells
		props.cells.forEach((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				fillCell(cellIndex, rowIndex, cell, ctx);
			});
		});

		// Draw the paths
		drawPaths(ctx, [props.paths?.firstPath || [], props.paths?.secondPath || []]);
	}, [cellSize, fillCell, props.cells, props.enableOpacity, props.paths, drawPaths]);

	// Add event listeners to the canvas
	useEffect(() => {
		if (!canvas.current) return;

		// Copy the current canvas
		const currentCanvas = canvas.current;

		const ctx = canvas.current.getContext('2d');

		if (!ctx) return;

		let highlightedCell: GridCell | null = null;

		// On mouse move, highlight the cell
		currentCanvas.onmousemove = (event: MouseEvent) => {
			const rect = currentCanvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const cellX = Math.floor(x / cellSize);
			const cellY = Math.floor(y / cellSize);

			// If there is a focused cell, fill it with the original color
			if (highlightedCell) {
				fillCell(highlightedCell.x, highlightedCell.y, props.cells[highlightedCell.y][highlightedCell.x], ctx);
			}

			// Store the new focused cell and highlight it
			highlightedCell = props.cells[cellY][cellX];
			if (highlightedCell) {
				highlightCell(highlightedCell.x, highlightedCell.y, ctx);
				drawPaths(ctx, [props.paths?.firstPath || [], props.paths?.secondPath || []]);
			}
		};

		// On mouse leave, remove the highlight
		currentCanvas.onmouseleave = () => {
			if (highlightedCell) {
				fillCell(highlightedCell.x, highlightedCell.y, props.cells[highlightedCell.y][highlightedCell.x], ctx);
				highlightedCell = null;
			}
		};

		// On click, set the focused cell
		currentCanvas.onclick = () => {
			props.onCellFocus(highlightedCell);

			// If there is a focused cell, fill it with the original color
			if (highlightedCell) {
				fillCell(highlightedCell.x, highlightedCell.y, props.cells[highlightedCell.y][highlightedCell.x], ctx);
			}
		};

		return () => {
			currentCanvas.onmousemove = null;
			currentCanvas.onmouseleave = null;
			currentCanvas.onclick = null;
		};
	}, [cellSize, fillCell, highlightCell, drawPaths, props]);

	// Return the canvas
	return <canvas ref={canvas} className={props.className} width={props.width} height={props.height} />;
}
