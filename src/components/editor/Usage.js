import React from 'react';
import usages from './usages';

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
					example={usage.example}
					example2={usage.example2}
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
		<br />
		<UsageExample addOnClick={props.addOnClick} example={props.example} />
		{props.example2.length > 0 ? (
			<>
				<br />
				<UsageExample
					addOnClick={props.addOnClick}
					example={props.example2}
				/>{' '}
			</>
		) : null}
		{props.example3 != undefined && props.example3.length > 0 ? (
			<>
				<br />
				<UsageExample
					addOnClick={props.addOnClick}
					example={props.example3}
				/>{' '}
			</>
		) : null}
		<br />
		<br />
		------------------------
		<br />
	</>
);

const UsageExample = props => (
	<a onClick={() => props.addOnClick(props.example)} href="#" className="add">
		{props.example}
	</a>
);

export default Usage;
