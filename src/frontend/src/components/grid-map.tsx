import { useEffect, useMemo, useRef } from 'react';

type ItemType = 'water' | 'land' | '';

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

export function GridMap(props: {
	width: number;
	height: number;
	focusedCell: GridCell | null;
	onCellFocus: (cell: GridCell | null) => void;

	cells: GridCell[][];
	enableOpacity?: boolean;
	className?: string;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const cellSize = useMemo(
		() => Math.min(props.width, props.height) / props.cells.length,
		[props.width, props.height, props.cells.length],
	);

	useEffect(() => {
		if (!canvas.current) return;

		const ctx = canvas.current.getContext('2d');

		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
		ctx.imageSmoothingEnabled = false;

		if (!props.enableOpacity) ctx.globalAlpha = 1;

		const fillCell = (x: number, y: number, cell: GridCell) => {
			ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
			if (props.enableOpacity) ctx.globalAlpha = cell.value;
			ctx.fillStyle = cell.type === 'water' ? 'blue' : 'green';
			ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
		};

		// Draw the cells
		props.cells.forEach((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				fillCell(cellIndex, rowIndex, cell);
			});
		});
	}, [cellSize, props.cells, props.enableOpacity]);

	useEffect(() => {
		if (!canvas.current) return;

		// Copy the current canvas
		const currentCanvas = canvas.current;

		const ctx = canvas.current.getContext('2d');

		if (!ctx) return;

		const fillCell = (x: number, y: number, cell: GridCell) => {
			ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
			if (props.enableOpacity) ctx.globalAlpha = cell.value;
			ctx.fillStyle = cell.type === 'water' ? 'blue' : 'green';
			ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
		};

		const highlightCell = (x: number, y: number) => {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
		};

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
				fillCell(highlightedCell.x, highlightedCell.y, props.cells[highlightedCell.y][highlightedCell.x]);
			}

			// Store the new focused cell and highlight it
			highlightedCell = props.cells[cellY][cellX];
			if (highlightedCell) highlightCell(highlightedCell.x, highlightedCell.y);
		};

		// On mouse leave, remove the highlight
		currentCanvas.onmouseleave = () => {
			if (highlightedCell) {
				fillCell(highlightedCell.x, highlightedCell.y, props.cells[highlightedCell.y][highlightedCell.x]);
				highlightedCell = null;
			}
		};

		// On click, set the focused cell
		currentCanvas.onclick = () => {
			props.onCellFocus(highlightedCell);

			// If there is a focused cell, fill it with the original color
			if (highlightedCell) {
				fillCell(highlightedCell.x, highlightedCell.y, props.cells[highlightedCell.y][highlightedCell.x]);
			}
		};

		return () => {
			currentCanvas.onmousemove = null;
			currentCanvas.onmouseleave = null;
			currentCanvas.onclick = null;
		};
	}, [cellSize, props]);

	return <canvas ref={canvas} className={props.className} width={props.width} height={props.height} />;
}
