import TextareaAutosize from '@mui/material/TextareaAutosize';
import React, { useEffect, useRef, useState } from 'react';
import { rename } from '../../constants/rename';
import { MapTheme } from '../../types/map/styles';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import RelativeMovable from './RelativeMovable';

interface MovedPosition {
    x: number;
    y: number;
}

interface ComponentElement {
    id: string;
    name: string;
    type?: string;
    line?: number;
    evolved?: boolean;
    evolving?: boolean;
    override?: string;
    maturity?: number;
    label?: {
        x: number;
        y: number;
    };
}

interface ComponentTextProps {
    mutateMapText: (newText: string) => void;
    mapText: string;
    overrideDrag?: (moved: MovedPosition) => void;
    element: ComponentElement;
    mapStyleDefs: MapTheme;
    onClick?: (e: React.MouseEvent<SVGTextElement, MouseEvent>) => void;
    scaleFactor: number;
    id?: string; // Optional prop for external ID assignment, not used internally
}

interface SizingState {
    rows: number;
    cols: number;
}

function ComponentText(props: ComponentTextProps): JSX.Element | null {
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

    const [sizing, setSizing] = useState<SizingState>({ rows: 0, cols: 0 });
    const [renameVal, setRenameVal] = useState<string>('');
    const [showTextField, setShowTextField] = useState<boolean>(false);
    const renameField = useRef<HTMLTextAreaElement>(null);
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
            renameField.current?.select();
            setRenameVal(element.name || '');
        }
    }, [showTextField, element]);

    function endDrag(moved: MovedPosition): void {
        const getLabelText = (x: number, y: number): string =>
            ` label [${parseFloat(x.toString()).toFixed(2)}, ${y}]`;

        const processEvolvedLine = (
            line: string,
            normalizedLine: string,
        ): string => {
            const evolveBase = 'evolve' + element.name.replace(/\s/g, '');
            const evolveOverride =
                element.override?.length && element.override.length > 0
                    ? '->' + element.override.replace(/\s/g, '')
                    : '';
            const evolveText =
                evolveBase + evolveOverride + (element.maturity || '');

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

        const processNormalLine = (
            line: string,
            normalizedLine: string,
        ): string => {
            const baseText =
                (element.type || '') + element.name.replace(/\s/g, '');
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

        const processLine = (line: string): string => {
            const normalizedLine = line.replace(/\s/g, '');
            return element.evolved
                ? processEvolvedLine(line, normalizedLine)
                : processNormalLine(line, normalizedLine);
        };

        mutateMapText(mapText.split('\n').map(processLine).join('\n'));
    }

    const handleKeyUp = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ): void => {
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

    const renderTextField = (): JSX.Element | null => {
        if (!enableDoubleClickRename || !showTextField) return null;

        return (
            <foreignObject
                x="0"
                y="-20"
                width={sizing.cols * charWidth + 10}
                height={sizing.rows * charHeight}
            >
                <TextareaAutosize
                    ref={renameField}
                    minRows={sizing.rows}
                    maxRows={sizing.rows}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRenameVal(e.target.value)
                    }
                    onKeyDown={(
                        e: React.KeyboardEvent<HTMLTextAreaElement>,
                    ) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                    style={{
                        position: 'fixed',
                        zIndex: 10000,
                        boxSizing: 'border-box',
                        flex: 1,
                        fontSize: '14px',
                        fontFamily: 'Consolas, "Lucida Console", monospace',
                        padding: 0,
                        margin: '0',
                        color: 'black',
                        width: `${sizing.cols * charWidth + 10}px`,
                    }}
                    onKeyUp={handleKeyUp}
                    defaultValue={element.name}
                    onDoubleClick={(e: React.MouseEvent<HTMLTextAreaElement>) =>
                        e.stopPropagation()
                    }
                    onClick={(e: React.MouseEvent<HTMLTextAreaElement>) =>
                        e.stopPropagation()
                    }
                />
            </foreignObject>
        );
    };

    const renderComponentText = (): JSX.Element | null => {
        if (showTextField) return null;

        const textContent =
            element.override && element.evolved
                ? element.override
                : element.name;
        const showTextFieldValue = enableDoubleClickRename
            ? setShowTextField
            : undefined;

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
                x={element.label?.x || 0}
                y={element.label?.y || 0}
                scaleFactor={scaleFactor}
            >
                {renderComponentText()}
                {renderTextField()}
            </RelativeMovable>
        </React.Fragment>
    );
}

export default ComponentText;
