import React, { useState } from 'react';

function Meta(props) {
	const [showMeta, setShowMeta] = useState(false);
	const onClickAlert = function() {
		setShowMeta(!showMeta);
	};

	return (
		<>
			{props.metaText.length > 0 ? <Alert toggleMeta={onClickAlert} /> : null}
			{showMeta ? <MetaText metaText={props.metaText} /> : null}
		</>
	);
}

var Alert = props => (
	<>
		<div id="meta-alert" className="alert alert-warning" role="alert">
			Your map has meta data -{' '}
			<span
				onClick={() => props.toggleMeta(true)}
				id="showMeta"
				className="clickable"
			>
				Show
			</span>
		</div>
	</>
);

var MetaText = props => (
	<>
		<div id="meta-container">
			<textarea
				readOnly
				className="form-control"
				id="meta"
				value={props.metaText}
			></textarea>
		</div>
	</>
);

export default Meta;
