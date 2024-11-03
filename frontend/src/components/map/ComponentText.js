import TextareaAutosize from '@mui/material/TextareaAutosize';
import React, { useEffect, useRef } from 'react';
import { rename } from '../../constants/rename';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import RelativeMovable from './RelativeMovable';

function ComponentText(props) {
	const { enableDoubleClickRename } = useFeatureSwitches();
	const {
		mutateMapText,
		mapText,
		overrideDrag,
		element,
		mapStyleDefs,
		onClick,
		scaleFactor,
	} = props;

    const [sizing, setSizing] = React.useState({ rows: 0, cols: 0 });
    const [renameVal, setRenameVal] = React.useState('');
    const [showTextField, setShowTextField] = React.useState(false);
    const renameField = useRef();
    const charWidth = 8; // Adjust based on your font and size
    const charHeight = 16; // Adjust based on your font and size

    useEffect(() => {
        const splits = renameVal.split('\n');
        const rows = splits.length + 1;

        const longestRowLength = Math.max(
            ...renameVal.split('\n').map(row => row.length),
        );

        setSizing({
            rows: rows < 1 ? 1 : rows,
            cols: longestRowLength < 5 ? 5 : longestRowLength,
        });
    }, [renameVal]);

    useEffect(() => {
        if (enableDoubleClickRename && showTextField) {
            renameField.current.select();
            setRenameVal(element.name);
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
									` label [${parseFloat(moved.x).toFixed(2)}, ${moved.y}]`
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
									` label [${parseFloat(moved.x).toFixed(2)}, ${moved.y}]`
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

    const handleKeyUp = event => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            console.log('Enter key pressed!');
            rename(
                element.line,
                element.name,
                renameVal.replace('\n', ''),
                mapText,
                mutateMapText,
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
				scaleFactor={scaleFactor}
			>
				{showTextField === false && (
					<ComponentTextSymbol
						id={'element_text_' + element.id}
						text={element.override ? element.override : element.name}
						evolved={element.evolved}
						styles={mapStyleDefs.component}
						onClick={onClick}
						setShowTextField={enableDoubleClickRename ? setShowTextField : null}
					/>
				)}
				{enableDoubleClickRename && showTextField && (
					<foreignObject
						x="0"
						y="-20"
						width={sizing.cols * charWidth + 10}
						height={sizing.rows * charHeight}
					>
						<TextareaAutosize
							variant="filled"
							ref={renameField}
							color="primary"
							autoComplete="off"
							size="small"
							cols={sizing.cols}
							onChange={(e) => setRenameVal(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
								}
							}}
							sx={{
								position: 'fixed',
								zIndex: 10000,
								boxSizing: 'border-box',
								flex: 1,
								'& textarea': {
									boxSizing: 'border-box',
									zIndex: 10001,
									position: 'relative',
									flex: 1,
									fontSize: '14px',
									fontFamily: 'Consolas, "Lucida Console", monospace',
									padding: 0,
									margin: '0',
									color: 'black',
								},
							}}
							margin="dense"
							onKeyUp={(e) => handleKeyUp(e)}
							defaultValue={element.name}
							onDoubleClick={(e) => e.stopPropagation()}
							onClick={(e) => e.stopPropagation()}
						/>
					</foreignObject>
				)}
			</RelativeMovable>
		</React.Fragment>
	);
}

export default ComponentText;
