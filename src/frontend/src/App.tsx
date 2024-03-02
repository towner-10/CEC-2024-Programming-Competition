import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { GridMap, type Cell, type GridCell } from '@/components/grid-map';
import { DirectionArrow } from '@/components/direction-arrow';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from './components/ui/button';

// Lazy load the GUI data
const gui_data = await import('@/assets/gui_data.json');

function App() {
	const [day, setDay] = useState(1);
	const [focusedCell, setFocusedCell] = useState<GridCell | null>(null);
	const [cells, setCells] = useState<Array<Array<Cell>>>([]);

	const handleDayChange = (newDay: number) => {
		if (newDay < 1 || newDay > 30) return;
		setDay(newDay);
	};

	useEffect(() => {
		const dayData = (
			gui_data.default as Array<{
				day: number;
				cells: Array<{
					x: number;
					y: number;
					type: 'water' | 'land';
				}>;
			}>
		).find((data) => data.day === day);
		if (!dayData) return;

		const newCells: Array<Array<Cell>> = [];

		dayData.cells.forEach((cell) => {
			if (!newCells[cell.y]) newCells[cell.y] = [];
			newCells[cell.y][cell.x] = {
				type: cell.type,
				value: Math.random(),
			};
		});

		setCells(newCells);
	}, [day]);

	return (
		<ThemeProvider>
			<header className="flex flex-row justify-between items-center border-b p-4 h-14">
				<h1>CEC 2024</h1>
				<ThemeToggle />
			</header>
			<main className="flex flex-row gap-4 m-4">
				<GridMap
					width={700}
					height={700}
					cells={cells}
					focusedCell={focusedCell}
					onCellFocus={(cell) => {
						setFocusedCell(cell);
					}}
				/>
				<div className="flex flex-col flex-grow justify-between items-center">
					<div className="flex flex-col gap-4 w-full">
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="View mode" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Obtain</SelectLabel>
									<SelectItem value="oil">Oil</SelectItem>
									<SelectItem value="precious-metals">Precious metals</SelectItem>
									<SelectItem value="helium">Helium</SelectItem>
								</SelectGroup>
								<SelectSeparator />
								<SelectGroup>
									<SelectLabel>Preserve</SelectLabel>
									<SelectItem value="shipwrecks">Shipwrecks</SelectItem>
									<SelectItem value="coral-reefs">Coral Reefs</SelectItem>
									<SelectItem value="endangered-species">Endangered Species</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Card>
							<CardHeader>
								<CardTitle>Current Cell Info</CardTitle>
								<CardDescription>
									Hover over a cell to get its relevant ranking and information.
								</CardDescription>
							</CardHeader>
							<CardContent>
								{focusedCell ? (
									<p>
										Cell at {focusedCell.x}, {focusedCell.y}
									</p>
								) : (
									<p className="text-muted-foreground">No cell selected...</p>
								)}
							</CardContent>
							<CardFooter className="justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setFocusedCell(null);
									}}
								>
									Clear
								</Button>
							</CardFooter>
						</Card>
					</div>

					<div className="flex flex-row justify-between items-center w-full max-w-md">
						<DirectionArrow
							direction="left"
							disabled={day === 1}
							onClick={() => handleDayChange(day - 1)}
						/>
						<h2>{`Day ${day}`}</h2>
						<DirectionArrow
							direction="right"
							disabled={day === 30}
							onClick={() => handleDayChange(day + 1)}
						/>
					</div>
				</div>
			</main>
		</ThemeProvider>
	);
}

export default App;
