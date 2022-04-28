import { Typography } from '@mui/material';
import React from 'react';
import MapCanvas from './MapCanvas';

export default function MapView(props) {
	const fill = {
		wardley: 'url(#wardleyGradient)',
		colour: 'none',
		plain: 'none',
		handwritten: 'none',
		dark: '#353347',
	};

	const textColour = {
		wardley: 'black',
		colour: 'black',
		plain: 'black',
		handwritten: 'black',
		dark: 'white',
	};

	return (
		<>
			{/* Wrapping div required to ensure that images aren't generated with a ton of whitespace */}
			<div
				ref={props.mapRef}
				className={props.mapStyleDefs.className}
				style={{ background: fill[props.mapStyleDefs.className] }}
			>
				<Typography
					sx={{
						textAlign: 'center',
						color: textColour[props.mapStyleDefs.className],
					}}
					variant="h5"
					id="title"
				>
					{props.mapTitle}
				</Typography>
				<div id="map">
					<MapCanvas mapPadding={20} {...props} />
				</div>
			</div>
		</>
	);
}
