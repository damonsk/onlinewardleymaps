import { IconButton, Typography } from '@mui/material';
import React from 'react';
import MapCanvas from './MapCanvas';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
export default function MapView(props) {
	const featureSwitches = useFeatureSwitches();
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
				style={{
					background: fill[props.mapStyleDefs.className],
					position: 'relative',
				}}
			>
				<Typography
					padding={'5px'}
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
				{featureSwitches.showToggleFullscreen && (
					<IconButton
						onClick={props.shouldHideNav}
						color={textColour[props.mapStyleDefs.className]}
						aria-label={props.hideNav ? 'Exit Fullscreen' : 'Fullscreen'}
						sx={{ position: 'absolute', right: '10px', top: '0' }}
					>
						{props.hideNav ? (
							<FullscreenExitIcon
								sx={{ color: textColour[props.mapStyleDefs.className] }}
							/>
						) : (
							<FullscreenIcon
								sx={{ color: textColour[props.mapStyleDefs.className] }}
							/>
						)}
					</IconButton>
				)}
			</div>
		</>
	);
}
