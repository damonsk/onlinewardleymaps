import React, {useEffect, useState} from 'react';
import {rename} from '../../constants/rename';
import {UnifiedComponent} from '../../types/unified';
import {normalizeComponentName} from '../../utils/componentNameMatching';
import {createComponentNameValidator, DEFAULT_VALIDATION_OPTIONS} from '../../utils/componentNameValidation';
import {useEditing} from '../EditingContext';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
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

    // Enhanced setText that handles multi-line content
    const handleTextChange = (newText: string) => {
        setText(newText);
        // Keep forceMultiLine state for potential future use
        if (newText.includes('\n') && !forceMultiLine) {
            setForceMultiLine(true);
        }
    };

    useEffect(() => {
        setText(actualComponent.name);
        // Reset multi-line mode when component name changes
        setForceMultiLine(actualComponent.name.includes('\n'));
    }, [actualComponent.name]);

    // Sync with EditingContext - respond to external editing requests (e.g., from context menu)
    useEffect(() => {
        const shouldBeEditing = isElementEditing(component.id);

        if (shouldBeEditing && !editMode) {
            setEditMode(true);
        } else if (!shouldBeEditing && editMode) {
            setEditMode(false);
        }
    }, [isElementEditing, component.id, editMode]);

    // Cleanup effect to handle component unmounting during editing
    useEffect(() => {
        return () => {
            if (editMode) {
                stopEditing(); // Clean up editing state if component is unmounted while editing
            }
        };
    }, [editMode, stopEditing]);

    const handleDoubleClick = (event?: React.MouseEvent) => {
        // Prevent event propagation to avoid conflicts with drag handlers and map clicks
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Execute onClick if provided (e.g., to select the component)
        if (onClick) {
            onClick();
        }
        
        // Always attempt to start edit mode on double-click if feature is enabled
        if (enableDoubleClickRename && mapText) {
            setEditMode(true);
            startEditing(component.id, 'component');
        }
    };

    const handleSave = () => {
        if (mutateMapText && mapText && text !== component.name && component.line) {
            // Determine if we need quoted format for multi-line or special characters
            const needsQuotes = text.includes('\n') || text.includes('"') || text.includes("'") || text.includes('\\');

            let processedText = text;
            if (needsQuotes) {
                // Escape the text for DSL format
                processedText = `"${
                    text
                        .replace(/\\/g, '\\\\') // Escape backslashes first
                        .replace(/"/g, '\\"') // Escape double quotes
                        .replace(/'/g, "\\'") // Escape single quotes
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
        // Default to multi-line (textarea) to encourage multi-line component names
        // Users can still create single-line names in textarea
        const isMultiLine = true; // Always use textarea for better multi-line support
        const editorHeight = 120; // Use consistent height for textarea

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
                        placeholder={'Enter component name...\n(Ctrl+Enter to save)'}
                        validation={{
                            required: true,
                            maxLength: DEFAULT_VALIDATION_OPTIONS.maxLength,
                            customValidator: createComponentNameValidator({
                                maxLength: 500,
                                maxLines: 5,
                                maxLineLength: 100,
                                allowEmptyLines: false,
                                sanitizeInput: true,
                                strictEscapeValidation: false,
                            }),
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

        const processEvolvedLine = (line: string): string => {
            const trimmedLine = line.trim();

            if (!trimmedLine.startsWith('evolve ')) {
                return line;
            }

            const evolveContent = trimmedLine.substring(7).trim(); // Remove 'evolve '

            // Extract component name from the evolve statement
            let componentNameInLine = '';
            if (evolveContent.startsWith('"')) {
                // Extract quoted component name
                const quotedMatch = evolveContent.match(/^"((?:[^"\\]|\\.)*)"/);
                if (quotedMatch) {
                    componentNameInLine = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                }
            } else {
                // Extract unquoted component name (up to first space or number)
                const unquotedMatch = evolveContent.match(/^([^\s\d]+(?:\s+[^\s\d]+)*)/);
                if (unquotedMatch) {
                    componentNameInLine = unquotedMatch[1].trim();
                }
            }

            // Use normalized matching to check if this is our component
            if (normalizeComponentName(componentNameInLine) === normalizeComponentName(component.name)) {
                if (line.indexOf('label') > -1) {
                    return line.replace(/\slabel\s\[([^[\]]+)\]/g, getLabelText(moved.x, moved.y));
                }
                return line.trim() + getLabelText(moved.x, moved.y);
            }

            return line;
        };

        const processNormalLine = (line: string): string => {
            const trimmedLine = line.trim();
            const componentType = component.type || 'component';

            if (!trimmedLine.startsWith(componentType + ' ')) {
                return line;
            }

            const componentContent = trimmedLine.substring(componentType.length + 1).trim(); // Remove type + space

            // Extract component name from the line
            let componentNameInLine = '';
            if (componentContent.startsWith('"')) {
                // Extract quoted component name
                const quotedMatch = componentContent.match(/^"((?:[^"\\]|\\.)*)"/);
                if (quotedMatch) {
                    componentNameInLine = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                }
            } else {
                // Extract unquoted component name (up to first bracket or label)
                const unquotedMatch = componentContent.match(/^([^\[\]]+?)(?:\s*\[|\s*label|\s*$)/);
                if (unquotedMatch) {
                    componentNameInLine = unquotedMatch[1].trim();
                }
            }

            // Use normalized matching to check if this is our component and has coordinates
            if (
                normalizeComponentName(componentNameInLine) === normalizeComponentName(component.name) &&
                line.includes('[') &&
                line.includes(']')
            ) {
                if (line.indexOf('label') > -1) {
                    return line.replace(/\slabel\s\[([^[\]]+)\]/g, getLabelText(moved.x, moved.y));
                }
                return line.trim() + getLabelText(moved.x, moved.y);
            }

            return line;
        };

        const processLine = (line: string): string => {
            return component.evolved ? processEvolvedLine(line) : processNormalLine(line);
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
                onDoubleClick={handleDoubleClick}
            />
        </RelativeMovable>
    );

    return <>{editMode ? renderEditMode() : renderText()}</>;
};

export default ComponentText;
