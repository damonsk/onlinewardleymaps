import React from 'react';

function MapTitle(props) {
	const { mapTitle } = props;

	return (
		<text
			x={0}
			y={-10}
			is="custom"
			id={'mapTitle'}
			font-weight={'bold'}
			font-size={'20px'}
		>
			{mapTitle}
		</text>
	);
}

export default MapTitle;
