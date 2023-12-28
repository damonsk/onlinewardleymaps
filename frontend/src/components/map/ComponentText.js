import React, { useRef, useEffect } from 'react';
import RelativeMovable from './RelativeMovable';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import TextField from '@mui/material/TextField';
import { rename } from '../../constants/rename';
import { featureSwitches } from '../../constants/featureswitches';

function ComponentText(props) {
	const {
		mutateMapText,
		mapText,
		overrideDrag,
		element,
		mapStyleDefs,
		onClick,
	} = props;

	const [showTextField, setShowTextField] = React.useState(false);
	const renameField = useRef();

	useEffect(() => {
		if (featureSwitches.enableDoubleClickRename && showTextField) {
			renameField.current.select();
		}
	}, [showTextField]);

	function endDrag(moved) {
		mutateMapText(
			mapText
				.split('\n')
				.map((line) => {
					if (element.evolved) {
						if (
							line
								.replace(/\s/g, '')
								.indexOf(
									'evolve' +
										element.name.replace(/\s/g, '') +
										(element.override.length > 0
											? '->' + element.override
											: '') +
										element.maturity
								) === 0
						) {
							if (line.replace(/\s/g, '').indexOf('label[') > -1) {
								return line.replace(
									/\slabel\s\[(.?|.+?)\]+/g,
									` label [${moved.x}, ${moved.y}]`
								);
							} else {
								return line.trim() + ` label [${moved.x}, ${moved.y}]`;
							}
						} else {
							return line;
						}
					} else {
						if (
							line
								.replace(/\s/g, '')
								.indexOf(
									element.type + element.name.replace(/\s/g, '') + '['
								) === 0
						) {
							if (line.replace(/\s/g, '').indexOf('label[') > -1) {
								return line.replace(
									/\slabel\s\[(.?|.+?)\]+/g,
									` label [${moved.x}, ${moved.y}]`
								);
							} else {
								return line.trim() + ` label [${moved.x}, ${moved.y}]`;
							}
						} else {
							return line;
						}
					}
				})
				.join('\n')
		);
	}

	const handleKeyUp = (event) => {
		if (event.key === 'Enter') {
			console.log('Enter key pressed!');
			rename(
				element.line,
				element.name,
				renameField.current.value,
				mapText,
				mutateMapText
			);
			setShowTextField(false);
		}
		if (event.key === 'Escape') {
			setShowTextField(false);
		}
	};

	return (
		<React.Fragment>
			<RelativeMovable
				id={'rm_element_text_' + element.id}
				fixedY={false}
				fixedX={false}
				onMove={overrideDrag ? overrideDrag : endDrag}
				x={element.label.x}
				y={element.label.y}
			>
				{showTextField === false && (
					<ComponentTextSymbol
						id={'element_text_' + element.id}
						text={element.override ? element.override : element.name}
						evolved={element.evolved}
						styles={mapStyleDefs.component}
						onClick={onClick}
						setShowTextField={
							featureSwitches.enableDoubleClickRename ? setShowTextField : null
						}
					/>
				)}
				{featureSwitches.enableDoubleClickRename && showTextField && (
					<foreignObject x="0" y="-15" width={100} height={50}>
						<TextField
							variant="filled"
							inputRef={renameField}
							color="primary"
							autoComplete="off"
							size="small"
							sx={{
								position: 'fixed',
								boxSizing: 'border-box',
								flex: 1,
								'& input': {
									boxSizing: 'border-box',
									flex: 1,
									fontSize: '14px',
									fontFamily: 'Consolas, "Lucida Console", monospace',
									padding: 0,
									margin: 0,

									color: 'black',
								},
							}}
							margin="0"
							onKeyUp={(e) => handleKeyUp(e)}
							defaultValue={element.name}
							onDoubleClick={(e) => e.stopPropagation()}
						/>
					</foreignObject>
				)}
			</RelativeMovable>
		</React.Fragment>
	);
}

export default ComponentText;
