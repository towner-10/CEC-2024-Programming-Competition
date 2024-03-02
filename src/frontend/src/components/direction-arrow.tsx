import { Button } from '@/components/ui/button';
import { MoveLeft, MoveRight } from 'lucide-react';

export function DirectionArrow(props: { direction: 'left' | 'right'; onClick?: () => void; disabled?: boolean }) {
	return (
		<Button variant="ghost" size="icon" disabled={props.disabled} onClick={props.onClick}>
			{props.direction === 'left' && <MoveLeft />}
			{props.direction === 'right' && <MoveRight />}
		</Button>
	);
}
