import { useCallback, useEffect, useRef } from 'react';

type ItemType = 'water' | 'land' | '';

type Cell = {
	type: ItemType;
	value: number;
};

export function GridMap(props: { width: number; height: number; cells: Cell[][]; className?: string }) {
	const canvas = useRef<HTMLCanvasElement>(null);

	const draw = useCallback(() => {
		if (!canvas.current) return;

		const ctx = canvas.current.getContext('2d');

		if (!ctx) return;

		// Scale cellSize based on the canvas size and the number of cells
		const cellSize = Math.min(props.width, props.height) / props.cells.length;

		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

		props.cells.forEach((row, rowIndex) => {
			row.forEach((cell, cellIndex) => {
				ctx.fillStyle = cell.type === 'water' ? 'blue' : 'green';
				ctx.fillRect(cellIndex * cellSize, rowIndex * cellSize, cellSize, cellSize);
			});
		});
	}, [props.cells, props.width, props.height]);

	useEffect(() => {
		draw();
	}, [draw]);

	return <canvas ref={canvas} className={props.className} width={props.width} height={props.height} />;
}
