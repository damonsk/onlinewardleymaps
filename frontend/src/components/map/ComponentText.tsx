import TextareaAutosize from '@mui/material/TextareaAutosize';
import React, {useEffect, useRef, useState} from 'react';
import {rename} from '../../constants/rename';
import {UnifiedComponent} from '../../types/unified';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import RelativeMovable from './RelativeMovable';

interface MovedPosition {
    x: number;
    y: number;
}

interface ModernComponentTextProps {
    component: UnifiedComponent;
    cx: string | number;
    cy: string | number;
    styles: any;
    mutateMapText: (newText: string) => void;
    mapText: string;
    id?: string;
    element?: any;
    onLabelMove?: (moved: MovedPosition) => void;
    scaleFactor?: number;
    mapStyleDefs?: any;
    onClick?: () => void;
}

const ComponentText: React.FC<ModernComponentTextProps> = ({
    component,
    cx,
    cy,
    styles,
    mutateMapText,
    mapText,
    onLabelMove,
    scaleFactor = 1,
    mapStyleDefs, // eslint-disable-line @typescript-eslint/no-unused-vars
    onClick,
    id, // eslint-disable-line @typescript-eslint/no-unused-vars
    element,
}) => {
    const {enableDoubleClickRename} = useFeatureSwitches();
    const [editMode, setEditMode] = useState(false);

    const actualComponent = element
        ? {
              name: element.name,
          }
        : component;

    const [text, setText] = useState(actualComponent.name);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setText(actualComponent.name);
    }, [actualComponent.name]);

    useEffect(() => {
        if (editMode && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [editMode]);

    const handleDoubleClick = () => {
        if (onClick) {
            onClick();
        } else if (enableDoubleClickRename && mapText) {
            setEditMode(true);
        }
    };

    const handleBlur = () => {
        setEditMode(false);
        if (mutateMapText && mapText && text !== component.name && component.line) {
            rename(component.line, component.name, text, mapText, mutateMapText);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setEditMode(false);
            if (mutateMapText && mapText && text !== component.name && component.line) {
                // Using the rename function with the correct parameters
                rename(component.line, component.name, text, mapText, mutateMapText);
            }
        }
    };
    const getX = () => {
        return component.label?.x || 0;
    };

    const getY = () => {
        return component.label?.y || 0;
    };

    const textFill = component.evolved ? styles.evolvedText : styles.text;
    const fontSize = styles?.fontSize || '14px';

    const renderEditMode = () => (
        <foreignObject x={Number(cx) + getX() - 50} y={Number(cy) + getY() - 25} width="100" height="50" style={{overflow: 'visible'}}>
            <TextareaAutosize
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%',
                    resize: 'none',
                    fontFamily: 'Arial',
                    fontSize: fontSize,
                    border: '1px solid #ccc',
                    padding: '2px',
                }}
            />
        </foreignObject>
    );

    // Function to handle label dragging and update map text
    function endDrag(moved: MovedPosition): void {
        // If we have a specific onLabelMove handler (e.g., for pipeline components), use it
        if (onLabelMove) {
            const adjustedMoved = component.pipeline
                ? {
                      x: Math.round(moved.x),
                      y: Math.round(moved.y),
                  }
                : moved;
            onLabelMove(adjustedMoved);
            return;
        }

        // Otherwise, handle the label update directly in the map text
        if (!mutateMapText || !mapText || !component.line) {
            console.warn('Cannot update label position: missing required props');
            return;
        }

        const getLabelText = (x: number, y: number): string => ` label [${x.toFixed(2)}, ${y.toFixed(2)}]`;

        const processEvolvedLine = (line: string, normalizedLine: string): string => {
            const evolveBase = 'evolve' + component.name.replace(/\s/g, '');
            const evolveOverride =
                component.override?.length && component.override.length > 0 ? '->' + component.override.replace(/\s/g, '') : '';
            const evolveText = evolveBase + evolveOverride + (component.maturity || '');

            if (normalizedLine.indexOf(evolveText) === 0) {
                if (normalizedLine.indexOf('label[') > -1) {
                    return line.replace(/\slabel\s\[([^[\]]+)\]/g, getLabelText(moved.x, moved.y));
                }
                return line.trim() + getLabelText(moved.x, moved.y);
            }
            return line;
        };

        const processNormalLine = (line: string, normalizedLine: string): string => {
            const baseText = (component.type || '') + component.name.replace(/\s/g, '');
            const searchText = baseText + '[';

            if (normalizedLine.indexOf(searchText) === 0) {
                if (normalizedLine.indexOf('label[') > -1) {
                    return line.replace(/\slabel\s\[([^[\]]+)\]/g, getLabelText(moved.x, moved.y));
                }
                return line.trim() + getLabelText(moved.x, moved.y);
            }
            return line;
        };

        const processLine = (line: string): string => {
            const normalizedLine = line.replace(/\s/g, '');
            return component.evolved ? processEvolvedLine(line, normalizedLine) : processNormalLine(line, normalizedLine);
        };

        mutateMapText(mapText.split('\n').map(processLine).join('\n'));
    }

    const renderText = () => (
        <RelativeMovable
            id={`${component.id}-text-movable`}
            x={getX()}
            y={getY()}
            scaleFactor={scaleFactor} // Pass scale factor to RelativeMovable
            onMove={endDrag}>
            <ComponentTextSymbol
                id={`${component.id}-text`}
                text={component.name}
                textTheme={{
                    fontSize: fontSize,
                    fontWeight: 'normal',
                    evolvedTextColor: textFill,
                    textColor: textFill,
                }}
                onClick={handleDoubleClick}
                setShowTextField={enableDoubleClickRename && mapText ? setEditMode : undefined}
            />
        </RelativeMovable>
    );

    return <>{editMode ? renderEditMode() : renderText()}</>;
};

export default ComponentText;
