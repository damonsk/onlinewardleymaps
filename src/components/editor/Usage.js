import React from 'react';
import usages from '../../constants/usages';

function Usage(props) {
	const addOnClick = txt => {
		let before = props.mapText;
		before =
			before + (props.mapText.trim().length > 0 ? '\n' : '') + txt.trim();
		props.mutateMapText(before);
	};

	return (
		<p id="usage" className="small">
			Usage:
			<br />
			<br />
			{usages.map((usage, idx) => (
				<UsageDefinition
					key={usage.key || idx}
					title={usage.title}
					summary={usage.summary}
					examples={usage.examples}
					addOnClick={addOnClick}
				/>
			))}
		</p>
	);
}

const UsageDefinition = props => (
	<>
		<strong>{props.title}</strong>
		{props.summary.length > 0 ? (
			<>
				<br /> {props.summary}{' '}
			</>
		) : null}
		<br />
		<strong>Example:</strong>
		{props.examples &&
			props.examples.map((example, idx) => (
				<React.Fragment key={idx}>
					<br />
					<UsageExample addOnClick={props.addOnClick} example={example} />
				</React.Fragment>
			))}
		<br />
		<br />
		------------------------
		<br />
	</>
);

const UsageExample = props => (
	<span
		onClick={() => props.addOnClick(props.example)}
		href="#"
		className="add clickable"
	>
		{props.example}
	</span>
);

export default Usage;
