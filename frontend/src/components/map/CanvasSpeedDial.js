import * as React from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { makeStyles } from '@mui/styles';
import ComponentSymbol from '../symbols/ComponentSymbol';
import {
	ComponentIcon,
	EcosystemIcon,
	InertiaIcon,
	MarketIcon,
} from '../symbols/icons';
import MarketSymbol from '../symbols/MarketSymbol';
import EcosystemSymbol from '../symbols/EcosystemSymbol';

const useStyles = makeStyles(() => ({
	smallerSpeedDial: {
		'& .MuiSpeedDial-fab': {
			width: '32px',
			height: '32px',
			minHeight: '32px',
			minWidth: '32px',
		},
	},
}));

export default function CanvasSpeedDial(props) {
	const classes = useStyles();
	const { setQuickAdd } = props;

	const actions = [
		{
			name: 'Component',
			icon: (
				<ComponentIcon
					cx={'20px'}
					cy={'20px'}
					hideLabel={true}
					mapStyleDefs={{
						component: {
							stroke: 'white',
							fill: 'transparent',
							strokeWidth: '1px',
							radius: '5',
						},
					}}
					evolved={false}
				/>
			),
			onClick: (setQuickAddCursor, props) => {
				setQuickAddCursor({
					cursor: (
						<ComponentSymbol
							styles={props.mapStyleDefs.component}
							cx={'8px'}
							cy={'8px'}
						/>
					),
					template: (val, y, x) => `component ${val} [${y}, ${x}]`,
				});
			},
		},
		{
			name: 'Component Inertia',
			icon: (
				<InertiaIcon
					cx={'20px'}
					cy={'20px'}
					hideLabel={true}
					mapStyleDefs={{
						component: {
							stroke: 'white',
							fill: 'transparent',
							strokeWidth: '1px',
							radius: '5',
						},
					}}
					evolved={false}
				/>
			),
			onClick: (setQuickAddCursor, props) => {
				setQuickAddCursor({
					cursor: (
						<ComponentSymbol
							styles={props.mapStyleDefs.component}
							cx={'8px'}
							cy={'8px'}
						/>
					),
					template: (val, y, x) => `component ${val} [${y}, ${x}]`,
				});
			},
		},
		{
			name: 'Market',
			icon: (
				<MarketIcon
					cx={'20px'}
					cy={'20px'}
					hideLabel={true}
					mapStyleDefs={{
						component: {
							stroke: 'white',
							fill: 'transparent',
							strokeWidth: '1px',
							radius: '5',
						},
					}}
					evolved={false}
				/>
			),
			onClick: (setQuickAddCursor, props) => {
				setQuickAddCursor({
					cursor: (
						<MarketSymbol
							styles={props.mapStyleDefs.component}
							cx={'8px'}
							cy={'8px'}
						/>
					),
					template: (val, y, x) => `market ${val} [${y}, ${x}]`,
				});
			},
		},
		{
			name: 'Ecosystem',
			icon: (
				<EcosystemIcon
					cx={'20px'}
					cy={'20px'}
					hideLabel={true}
					mapStyleDefs={{
						component: {
							stroke: 'white',
							fill: 'transparent',
							strokeWidth: '1px',
							radius: '5',
						},
					}}
					evolved={false}
				/>
			),
			onClick: (setQuickAddCursor, props) => {
				setQuickAddCursor({
					cursor: (
						<EcosystemSymbol
							styles={props.mapStyleDefs.component}
							cx={'8px'}
							cy={'8px'}
						/>
					),
					template: (val, y, x) => `component ${val} [${y}, ${x}]`,
				});
			},
		},
	];

	return (
		<>
			<Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
				<SpeedDial
					ariaLabel="SpeedDial basic example"
					className={classes.smallerSpeedDial}
					sx={{ position: 'absolute', top: -10, right: 60 }}
					icon={<SpeedDialIcon />}
					direction="left"
				>
					{actions.map((action) => (
						<SpeedDialAction
							key={action.name}
							icon={action.icon}
							tooltipTitle={action.name}
							onClick={() => action.onClick(setQuickAdd, props)}
						/>
					))}
				</SpeedDial>
			</Box>
		</>
	);
}
