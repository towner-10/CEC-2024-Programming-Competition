import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { GridMap } from './components/grid-map';

function App() {
	return (
		<ThemeProvider>
			<header className="flex flex-row justify-between items-center border-b border-b-primary p-4 h-16">
				<h1 className="text-2xl font-medium">CEC 2024</h1>
				<ThemeToggle />
			</header>
			<main className='m-4'>
				<GridMap
					width={600}
					height={600}
					cells={Array.from({ length: 100 }, () =>
						Array.from({ length: 100 }, () => ({
							type: Math.random() > 0.5 ? 'water' : 'land',
							value: Math.random(),
						})),
					)}
				/>
			</main>
		</ThemeProvider>
	);
}

export default App;
