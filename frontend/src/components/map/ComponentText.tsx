import React, { useEffect, useState } from 'react';
import { rename } from '../../constants/rename';
import { UnifiedComponent } from '../../types/unified';
import { useEditing } from '../EditingContext';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import InlineEditor from './InlineEditor';
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
    mapDimensions?: {width: number; height: number};
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
    mapStyleDefs,
    onClick,
    id,
    element,
    mapDimensions,
}) => {
    const {enableDoubleClickRename} = useFeatureSwitches();
    const {startEditing, stopEditing, isElementEditing} = useEditing();
    const [editMode, setEditMode] = useState(false);
    const [forceMultiLine, setForceMultiLine] = useState(false);

    const actualComponent = element
        ? {
              name: element.name,
          }
        : component;

    const [text, setText] = useState(actualComponent.name);

    // Enhanced setText that detects multi-line content
    const handleTextChange = (newText: string) => {
        setText(newText);
        // If the user types line breaks, switch to multi-line mode
        if (newText.includes('\n') && !forceMultiLine) {
            setForceMultiLine(true);
        }
    };

    useEffect(() => {
        setText(actualComponent.name);
        // Reset multi-line mode when component name changes
        setForceMultiLine(actualComponent.name.includes('\n'));
    }, [actualComponent.name]);

    // Cleanup effect to handle component unmounting during editing
    useEffect(() => {
        return () => {
            if (editMode) {
                stopEditing(); // Clean up editing state if component is unmounted while editing
            }
        };
    }, [editMode, stopEditing]);

    const handleDoubleClick = () => {
        if (onClick) {
            onClick();
        } else if (enableDoubleClickRename && mapText) {
            setEditMode(true);
            startEditing(component.id, 'component');
        }
    };

    const handleSave = () => {
        if (mutateMapText && mapText && text !== component.name && component.line) {
            // Determine if we need quoted format for multi-line or special characters
            const needsQuotes = text.includes('\n') || text.includes('"') || text.includes('\\');

            let processedText = text;
            if (needsQuotes) {
                // Escape the text for DSL format
                processedText = `"${
                    text
                        .replace(/\\/g, '\\\\') // Escape backslashes first
                        .replace(/"/g, '\\"') // Escape quotes
                        .replace(/\n/g, '\\n') // Escape line breaks
                }"`;
            }

            const result = rename(component.line, component.name, processedText, mapText, mutateMapText);
            if (!result.success) {
                console.error('Failed to save component:', result.error);
                // For now, just log the error. In a production app, you might show a toast notification
                // or keep the editor open to allow the user to retry
                alert(result.error); // Simple error notification - could be enhanced with a proper toast system
                return; // Don't close the editor if save failed
            }
        }
        setEditMode(false);
        setForceMultiLine(false); // Reset multi-line mode
        stopEditing();
    };

    const handleCancel = () => {
        setText(actualComponent.name);
        setEditMode(false);
        setForceMultiLine(false); // Reset multi-line mode
        stopEditing();
    };
    const getX = () => {
        return component.label?.x || 0;
    };

    const getY = () => {
        return component.label?.y || 0;
    };

    const textFill = component.evolved ? styles.evolvedText : styles.text;
    const fontSize = styles?.fontSize || '14px';

    const renderEditMode = () => {
        // Always use the InlineEditor for consistent behavior across browsers
        // Detect multi-line content dynamically
        const isMultiLine = forceMultiLine || text.includes('\n') || component.name.includes('\n');
        const editorHeight = isMultiLine ? 120 : 80;

        return (
            <foreignObject
                x={Number(cx) + getX() - 60}
                y={Number(cy) + getY() - 30}
                width="140"
                height={editorHeight}
                style={{
                    overflow: 'visible',
                }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}>
                    <InlineEditor
                        value={text}
                        onChange={handleTextChange}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        x={0}
                        y={0}
                        width={120}
                        fontSize={fontSize}
                        mapStyleDefs={mapStyleDefs}
                        autoFocus={true}
                        selectAllOnFocus={true}
                        isMultiLine={isMultiLine}
                        placeholder={isMultiLine ? 'Enter component name...\n(Ctrl+Enter to save)' : 'Enter component name...'}
                        validation={{
                            required: true,
                            maxLength: 500, // Increased for multi-line content
                        }}
                    />
                </div>
            </foreignObject>
        );
    };

    function endDrag(moved: MovedPosition): void {
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
