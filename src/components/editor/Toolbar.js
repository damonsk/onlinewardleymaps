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
	const [openInfos, setOpenInfo] = useState(Array(usages.length).fill(false));

	return (
		<>
			{usages.map((usage, idx) => {
				const { Icon } = usage;
				const open = openInfos[idx];
				const InfoIcon = open ? BsInfoCircleFill : BsInfoCircle;
				return (
					<div key={idx} style={{ padding: '5px' }}>
						<div style={{ display: 'flex' }}>
							<Button
								variant={'light'}
								onClick={() => addOnClick(usage.example)}
							>
								{Icon ? (
									<Icon mapStyleDefs={props.mapStyleDefs} />
								) : (
									usage.toolbarButtonText || usage.title
								)}
							</Button>
							<div>
								<InfoIcon
									onClick={() =>
										setOpenInfo(openInfos.map((val, i) => idx === i && !val))
									}
								/>
							</div>
						</div>
						<Collapse in={open}>
							<div className="small" style={{ margin: '10px 0px 0px 15px' }}>
								<UsageDefinition
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
