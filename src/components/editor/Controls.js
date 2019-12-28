import React from 'react';

function Controls(props) {
	const example = () => {
		const exampleText =
			'title Tea Shop' +
			'\r\n' +
			'component Business [1, 0.65]' +
			'\r\n' +
			'component Public [1, 0.79]' +
			'\r\n' +
			'component Cup of Tea [0.8, 0.73]' +
			'\r\n' +
			'component Cup [0.7, 0.88]' +
			'\r\n' +
			'component Tea [0.6, 0.83]' +
			'\r\n' +
			'component Hot Water [0.47, 0.8]' +
			'\r\n' +
			'component Water [0.35, 0.83]' +
			'\r\n' +
			'component Kettle [0.3, 0.3] evolve 0.78' +
			'\r\n' +
			'component Power [0.1, 0.8]' +
			'\r\n' +
			'Business->Cup of Tea' +
			'\r\n' +
			'Public->Cup of Tea' +
			'\r\n' +
			'Cup of Tea->Cup' +
			'\r\n' +
			'Cup of Tea->Tea' +
			'\r\n' +
			'Cup of Tea->Hot Water' +
			'\r\n' +
			'Hot Water->Water' +
			'\r\n' +
			'Hot Water->Kettle ' +
			'\r\n' +
			'Kettle->Power';
		props.mutateMapText(exampleText);
	};

	return (
		<React.Fragment>
			<button
				id="new-map"
				onClick={props.newMapClick}
				type="button"
				className="btn btn-secondary"
			>
				New Map
			</button>
			<button
				id="example-map"
				onClick={example}
				type="button"
				className="btn btn-secondary"
			>
				Example Map
			</button>
			<button
				id="save-map"
				onClick={props.saveMapClick}
				type="button"
				className="btn btn-primary"
			>
				Save
			</button>
			<button
				id="download-image"
				onClick={props.downloadMapImage}
				type="button"
				className="btn btn-primary"
			>
				Download
			</button>
		</React.Fragment>
	);
}

export default Controls;
