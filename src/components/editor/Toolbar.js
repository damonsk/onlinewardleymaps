import React, { useState } from 'react';
import usages from '../../constants/usages';

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
								onClick={() => addOnClick(usage.examples[0])}
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
									examples={usage.examples}
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

export default Toolbar;
