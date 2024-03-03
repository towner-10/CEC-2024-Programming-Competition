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

function resourceValueToPercentage(value: number | null): string {
	if (value === null) return 'N/A';
	return `${(value * 100).toFixed(2)}%`;
}

function App() {
	const [day, setDay] = useState(1);
	const [mapData, setMapData] = useState<MapData | null>(null);
	const [resourceView, setResourceView] = useState<string>('');
	const [focusedCell, setFocusedCell] = useState<GridCell | null>(null);
	const [cells, setCells] = useState<Array<Array<GridCell>>>([]);
	const [pathData, setPathData] = useState<{
		first: Array<{ x: number; y: number }>;
		second: Array<{ x: number; y: number }>;
	}>({
		first: [],
		second: [],
	});

	const loadCellsByDay = useCallback(
		(day: number, currentResourceView?: string, tempData?: MapData) => {
			const data = tempData || mapData;
			const resource = currentResourceView || resourceView;
			if (!data) return;

			const dayData = data.find((data) => data.day === day);
			if (!dayData) return;

			const newCells: Array<Array<GridCell>> = [];

			dayData.cells.forEach((cell) => {
				if (!newCells[cell.y]) newCells[cell.y] = [];
				let value = 1.0;

				if (resource !== '') {
					if (cell.resources[resource as keyof GridCell['resources']] === null) {
						value = 0.0;
					} else {
						value = cell.resources[resource as keyof GridCell['resources']] || 0;
					}
				}

				newCells[cell.y][cell.x] = {
					...cell,
					value,
				};
			});

			setCells(newCells);

			if (focusedCell) {
				const newFocusedCell = newCells[focusedCell.y][focusedCell.x];
				setFocusedCell(newFocusedCell);
			}
		},
		[focusedCell, mapData, resourceView],
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
		const importMapData = async () => {
			console.log('Importing map data...');
			const gui_data = await import('@/assets/gui_data.json');
			const temp_map_data = gui_data.default as MapData;
			loadCellsByDay(1, resourceView, temp_map_data);

			// Set the cells
			setMapData(temp_map_data);
		};

		const importPathData = async () => {
			console.log('Importing path data...');
			const path_data = await import('@/assets/paths.json');
			const temp_path_data = path_data.default;
			setPathData(temp_path_data as typeof pathData);
		};

		importMapData();
		importPathData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
							paths={{
								firstPath: pathData.first,
								secondPath: pathData.second,
							}}
							enableOpacity={resourceView !== ''}
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
									else {
										setResourceView(value);
										loadCellsByDay(day, value);
									}
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
											<h2>Resource Valuation:</h2>
											<ul>
												<li>Oil: {resourceValueToPercentage(focusedCell.resources.oil)}</li>
												<li>Metal: {resourceValueToPercentage(focusedCell.resources.metal)}</li>
												<li>
													Helium: {resourceValueToPercentage(focusedCell.resources.helium)}
												</li>
												<li>Ship: {resourceValueToPercentage(focusedCell.resources.ship)}</li>
												<li>Coral: {resourceValueToPercentage(focusedCell.resources.coral)}</li>
												<li>
													Species: {resourceValueToPercentage(focusedCell.resources.species)}
												</li>
												<li>
													Temperature:{' '}
													{resourceValueToPercentage(focusedCell.resources.temperature)}
												</li>
												<li>Algal: {resourceValueToPercentage(focusedCell.resources.algal)}</li>
												<li>Wind: {resourceValueToPercentage(focusedCell.resources.wind)}</li>
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
