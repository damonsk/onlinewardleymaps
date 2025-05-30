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

    if (!element) {
        return null;
    }

    const [sizing, setSizing] = React.useState({ rows: 0, cols: 0 });
    const [renameVal, setRenameVal] = React.useState('');
    const [showTextField, setShowTextField] = React.useState(false);
    const renameField = useRef();
    const charWidth = 8;
    const charHeight = 16;

    useEffect(() => {
        const splits = renameVal.split('\n');
        const rows = splits.length + 1;
        const longestRowLength = Math.max(
            ...renameVal.split('\n').map((row) => row.length),
        );
        setSizing({
            rows: rows < 1 ? 1 : rows,
            cols: longestRowLength < 5 ? 5 : longestRowLength,
        });
    }, [renameVal]);

    useEffect(() => {
        if (enableDoubleClickRename && showTextField && element) {
            renameField.current.select();
            setRenameVal(element.name || '');
        }
    }, [showTextField, element]);

    function endDrag(moved) {
        const getLabelText = (x, y) =>
            ` label [${parseFloat(x).toFixed(2)}, ${y}]`;

        const processEvolvedLine = (line, normalizedLine) => {
            const evolveBase = 'evolve' + element.name.replace(/\s/g, '');
            const evolveOverride =
                element.override?.length > 0
                    ? '->' + element.override.replace(/\s/g, '')
                    : '';
            const evolveText = evolveBase + evolveOverride + element.maturity;

            if (normalizedLine.indexOf(evolveText) === 0) {
                if (normalizedLine.indexOf('label[') > -1) {
                    return line.replace(
                        /\slabel\s\[(.?|.+?)\]+/g,
                        getLabelText(moved.x, moved.y),
                    );
                }
                return line.trim() + getLabelText(moved.x, moved.y);
            }
            return line;
        };

        const processNormalLine = (line, normalizedLine) => {
            const baseText = element.type + element.name.replace(/\s/g, '');
            const searchText = baseText + '[';

            if (normalizedLine.indexOf(searchText) === 0) {
                if (normalizedLine.indexOf('label[') > -1) {
                    return line.replace(
                        /\slabel\s\[(.?|.+?)\]+/g,
                        getLabelText(moved.x, moved.y),
                    );
                }
                return line.trim() + getLabelText(moved.x, moved.y);
            }
            return line;
        };

        const processLine = (line) => {
            const normalizedLine = line.replace(/\s/g, '');
            return element.evolved
                ? processEvolvedLine(line, normalizedLine)
                : processNormalLine(line, normalizedLine);
        };

        mutateMapText(mapText.split('\n').map(processLine).join('\n'));
    }

    const handleKeyUp = (event) => {
        event.stopPropagation();
        if (!element || !element.line || !element.name || !renameVal) {
            setShowTextField(false);
            return;
        }

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

    const renderTextField = () => {
        if (!enableDoubleClickRename || !showTextField) return null;

        return (
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
                    onKeyUp={handleKeyUp}
                    defaultValue={element.name}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                />
            </foreignObject>
        );
    };

    const renderComponentText = () => {
        if (showTextField) return null;

        const textContent =
            element.override && element.evolved
                ? element.override
                : element.name;
        const showTextFieldValue = enableDoubleClickRename
            ? setShowTextField
            : null;

        return (
            <ComponentTextSymbol
                id={'element_text_' + element.id}
                text={textContent}
                evolved={element.evolved}
                textTheme={mapStyleDefs.component}
                onClick={onClick}
                setShowTextField={showTextFieldValue}
            />
        );
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
                {renderComponentText()}
                {renderTextField()}
            </RelativeMovable>
        </React.Fragment>
    );
}

export default ComponentText;
