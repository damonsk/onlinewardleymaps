import React, { useState } from 'react';
import usages from './usages';

import { Button, Collapse } from 'react-bootstrap';

import { BsInfoCircle, BsInfoCircleFill } from 'react-icons/bs';

const Toolbar = props => {
	const addOnClick = txt => {
		let before = props.mapText;
		before =
			before + (props.mapText.trim().length > 0 ? '\n' : '') + txt.trim();
		props.mutateMapText(before);
	};
	const [openIcons, setOpenIcon] = useState(Array(usages.length).fill(false));

	return (
		<>
			{props.children}
			<br />
			<br />
			{usages.map((usage, idx) => {
				const open = openIcons[idx];
				const InfoIcon = open ? BsInfoCircleFill : BsInfoCircle;
				return (
					<div key={idx}>
						<Button
							variant={props.toggleToolbar ? 'primary' : 'outline-primary'}
							onClick={() => addOnClick(usage.example)}
						>
							{usage.toolbarButtonText || usage.title}
						</Button>
						<InfoIcon
							onClick={() =>
								setOpenIcon(openIcons.map((val, i) => idx === i && !val))
							}
						/>
						<Collapse in={open}>
							<div>
								<UsageDefinition
									key={usage.key || idx}
									title={usage.title}
									summary={usage.summary}
									example={usage.example}
									example2={usage.example2}
									addOnClick={addOnClick}
								/>
							</div>
						</Collapse>
					</div>
				);
			})}
		</>
	);
};

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

export default Toolbar;
