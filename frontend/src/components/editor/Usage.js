import React from 'react';
import usages from '../../constants/usages';
import { Divider, Link, Typography } from '@mui/material';

function Usage(props) {
	const addOnClick = (txt) => {
		let before = props.mapText;
		before =
			before + (props.mapText.trim().length > 0 ? '\n' : '') + txt.trim();
		props.mutateMapText(before);
	};

	return (
		<>
			{usages.map((usage, idx) => (
				<UsageDefinition
					key={usage.key || idx}
					title={usage.title}
					Icon={usage.Icon}
					mapStyleDefs={props.mapStyleDefs}
					summary={usage.summary}
					examples={usage.examples}
					addOnClick={addOnClick}
				/>
			))}
		</>
	);
}

const UsageDefinition = (props) => { 
	const { Icon, mapStyleDefs } = props;
	return (
	<>
		<Typography variant='h3'>{props.title}</Typography>
		{props.summary.length > 0 ? (
			
				<Typography variant='body1'>{props.summary}{' '}</Typography>
		) : null}
		<Typography variant='h5'>Example</Typography>
		{props.examples &&
			props.examples.map((example, idx) => (
				<React.Fragment key={idx}>
					<UsageExample addOnClick={props.addOnClick} example={example} />
				</React.Fragment>
			))}
			{false == true && Icon ? <Icon mapStyleDefs={mapStyleDefs} hideLabel={false} /> : null}
		<Divider sx={{marginTop: 2, marginBottom: 2}} />
	</>
)};

const UsageExample = (props) => (
	<Typography>
		<Link
			sx={{cursor: 'pointer'}}
			onClick={() => props.addOnClick(props.example)}
			className="add clickable"
		>
			{props.example}
		</Link>
	</Typography>
);

export default Usage;
