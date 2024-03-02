import { useCallback, useEffect, useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { GridMap, type GridCell } from '@/components/grid-map';
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
import { Skeleton } from './components/ui/skeleton';

type MapData = Array<{
	day: number;
	cells: Array<GridCell>;
}>;

// Simple function to write numbers with commas
// https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
function numberWithCommas(x: number | null) {
	if (x === null) return 'N/A';
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function App() {
	const [day, setDay] = useState(1);
	const [mapData, setMapData] = useState<MapData | null>(null);
	const [resourceView, setResourceView] = useState<string>('');
	const [focusedCell, setFocusedCell] = useState<GridCell | null>(null);
	const [cells, setCells] = useState<Array<Array<GridCell>>>([]);

	const loadCellsByDay = useCallback(
		(day: number, tempData?: MapData) => {
			const data = tempData || mapData;
			if (!data) return;

			const dayData = data.find((data) => data.day === day);
			if (!dayData) return;

			const newCells: Array<Array<GridCell>> = [];

			dayData.cells.forEach((cell) => {
				if (!newCells[cell.y]) newCells[cell.y] = [];
				newCells[cell.y][cell.x] = {
					...cell,
					value: 1.0,
				};
			});

			setCells(newCells);

			if (focusedCell) {
				const newFocusedCell = newCells[focusedCell.y][focusedCell.x];
				setFocusedCell(newFocusedCell);
			}
		},
		[focusedCell, mapData],
	);

	const handleDayChange = useCallback(
		(newDay: number) => {
			if (!mapData) return;
			if (newDay < 1 || newDay > 30) return;
			setDay(newDay);
			loadCellsByDay(newDay);
		},
		[loadCellsByDay, mapData],
	);

	// Dynamically import the map data from the JSON file
	useEffect(() => {
		console.log('Importing map data...');

		const importMapData = async () => {
			const gui_data = import('@/assets/gui_data.json');
			const temp_map_data = (await gui_data).default as MapData;
			loadCellsByDay(1, temp_map_data);

			// Set the cells
			setMapData(temp_map_data);
		};

		importMapData();
		
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (cells.length === 0) return;
		if (resourceView === '') return;

		// Get normalized value for the selected resource view
		const getResourceValue = (cell: GridCell) => {
			if (!resourceView) return 1.0;
			return (cell.resources[resourceView as keyof GridCell['resources']] || 0.0) / 10000;
		};

		// Update the cells with the new resource view
		const newCells = cells.map((row) => {
			return row.map((cell) => {
				return {
					...cell,
					value: getResourceValue(cell),
				};
			});
		});

		setCells(newCells);
	}, [cells, resourceView]);

	return (
		<ThemeProvider>
			<div className="mx-8 min-h-screen">
				<header className="flex flex-row justify-between items-center border-b p-4 h-14">
					<h1>
						FIN<span className="font-normal">Point</span>{' '}
						<span className="font-extralight">by WANBIS Corp.</span>
					</h1>
					<ThemeToggle />
				</header>
				<main className="flex flex-row gap-4 m-4">
					{cells.length === 0 ? (
						<Skeleton className="h-[700px] w-[700px]" />
					) : (
						<GridMap
							width={700}
							height={700}
							cells={cells}
							className="rounded-md"
							focusedCell={focusedCell}
							onCellFocus={(cell) => {
								setFocusedCell(cell);
							}}
						/>
					)}
					<div className="flex flex-col flex-grow justify-between items-center">
						<div className="flex flex-col gap-4 w-full">
							<Select
								value={resourceView}
								onValueChange={(value) => {
									if (value === 'none') setResourceView('');
									else setResourceView(value);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select resource view" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value="none">None</SelectItem>
									</SelectGroup>
									<SelectGroup>
										<SelectLabel>Obtain</SelectLabel>
										<SelectItem value="oil">Oil</SelectItem>
										<SelectItem value="metal">Precious metals</SelectItem>
										<SelectItem value="helium">Helium</SelectItem>
									</SelectGroup>
									<SelectSeparator />
									<SelectGroup>
										<SelectLabel>Preserve</SelectLabel>
										<SelectItem value="ship">Shipwrecks</SelectItem>
										<SelectItem value="coral">Coral Reefs</SelectItem>
										<SelectItem value="species">Endangered Species</SelectItem>
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
										<div className="flex flex-col space-y-4">
											<p>
												Cell at {focusedCell.x}, {focusedCell.y}
											</p>
											<h2>Resources:</h2>
											<ul>
												<li>Oil: {numberWithCommas(focusedCell.resources.oil)} / 10,000</li>
												<li>Metal: {numberWithCommas(focusedCell.resources.metal)} / 10,000</li>
												<li>
													Helium: {numberWithCommas(focusedCell.resources.helium)} / 10,000
												</li>
												<li>Ship: {numberWithCommas(focusedCell.resources.ship)} / 10,000</li>
												<li>Coral: {numberWithCommas(focusedCell.resources.coral)} / 10,000</li>
												<li>
													Species: {numberWithCommas(focusedCell.resources.species)} / 10,000
												</li>
												<li>
													Temperature: {numberWithCommas(focusedCell.resources.temperature)} /
													10,000
												</li>
												<li>Algal: {numberWithCommas(focusedCell.resources.algal)} / 10,000</li>
												<li>Wind: {numberWithCommas(focusedCell.resources.wind)} / 10,000</li>
											</ul>
										</div>
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
			</div>
		</ThemeProvider>
	);
}

export default App;
