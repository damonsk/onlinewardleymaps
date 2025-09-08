import React, {useCallback, useEffect, useState} from 'react';
import {useI18n} from '../../hooks/useI18n';
import {rename} from '../../constants/rename';
import {UnifiedComponent} from '../../types/unified';
import {normalizeComponentName} from '../../utils/componentNameMatching';
import {createComponentNameValidator, DEFAULT_VALIDATION_OPTIONS} from '../../utils/componentNameValidation';
import {calculateComponentEditorPosition, debugPosition} from '../../utils/svgPositioning';
import {useEditing} from '../EditingContext';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import InlineEditor from './InlineEditor';
import {useUserFeedback} from './hooks/useUserFeedback';
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
    mapStyleDefs,
    onClick,
    element,
}) => {
    // Resolve the display text for the component (handles evolved overrides and quoted names)
    const getDisplayText = useCallback(() => {
        // For evolved components, always prioritize the unquoted override name
        if (component.evolved && component.override) {
            if (component.override.startsWith('"') && component.override.endsWith('"')) {
                return component.override.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            }
            return component.override;
        }

        // For regular components, check if the name needs unescaping
        let name = element?.name || component.name;

        // If the component name is quoted (multi-line or escaped), unescape it for display
        if (name && name.startsWith('"') && name.endsWith('"')) {
            name = name.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        }

        return name;
    }, [component.evolved, component.override, component.name, element?.name]);
    const {enableDoubleClickRename} = useFeatureSwitches();
    const {startEditing, stopEditing, isElementEditing, editingState} = useEditing();
    const {originalT} = useI18n();
    const {showUserFeedback} = useUserFeedback();
    const [editMode, setEditMode] = useState(false);
    const [text, setText] = useState(getDisplayText());

    // Enhanced setText that handles multi-line content
    const handleTextChange = (newText: string) => {
        setText(newText);
    };

    useEffect(() => {
        setText(getDisplayText());
    }, [component.name, component.override, component.evolved, element?.name, getDisplayText]);

    // Sync with EditingContext - respond to external editing requests (e.g., from context menu)
    useEffect(() => {
        // Use string comparison to handle type mismatch between string and number IDs
        const shouldBeEditing = editingState.isEditing && String(editingState.editingElementId) === String(component.id);

        if (shouldBeEditing && !editMode) {
            setEditMode(true);
        } else if (!shouldBeEditing && editMode) {
            setEditMode(false);
        }
    }, [editingState.isEditing, editingState.editingElementId, component.id, editMode]);

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

    const renameEvolvedComponent = (
        oldName: string,
        newName: string,
        mapText: string,
        mutateMapText: (newText: string) => void,
    ): {success: boolean; error?: string} => {
        try {
            const lines = mapText.split('\n');
            let updated = false;

            const updatedLines = lines.map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine.startsWith('evolve ')) {
                    return line;
                }

                const evolveContent = trimmedLine.substring(7).trim(); // Remove 'evolve '

                // More robust parsing for evolve statements
                // Handle cases like: ComponentA->ComponentB 0.75 or "Component A"->"Component B" 0.75
                let sourcePart = '';
                let evolvedPart = '';
                let maturityPart = '';
                let hasArrow = false;

                // Find the arrow position by looking for -> that's not inside quotes
                let arrowPos = -1;
                let inQuotes = false;
                let escapeNext = false;

                for (let i = 0; i < evolveContent.length - 1; i++) {
                    const char = evolveContent[i];
                    const nextChar = evolveContent[i + 1];

                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }

                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }

                    if (char === '"') {
                        inQuotes = !inQuotes;
                        continue;
                    }

                    if (!inQuotes && char === '-' && nextChar === '>') {
                        arrowPos = i;
                        hasArrow = true;
                        break;
                    }
                }

                if (hasArrow && arrowPos !== -1) {
                    // Case 1: Has arrow (evolve foo->bar 0.9)
                    sourcePart = evolveContent.substring(0, arrowPos).trim();
                    const remainder = evolveContent.substring(arrowPos + 2).trim();

                    // Parse the remainder to separate evolved name from maturity and optional label
                    const maturityPattern = /\s+([0-9]+(?:\.[0-9]+)?)(\s+label\s+\[[^\]]+\])?$/;
                    const maturityMatch = remainder.match(maturityPattern);

                    if (maturityMatch) {
                        const maturityStartIndex = remainder.lastIndexOf(maturityMatch[0]);
                        evolvedPart = remainder.substring(0, maturityStartIndex).trim();
                        maturityPart = maturityMatch[0];
                    } else {
                        evolvedPart = remainder;
                        maturityPart = '';
                    }

                    // Extract evolved component name from the evolve statement
                    let evolvedNameInLine = '';
                    if (evolvedPart.startsWith('"') && evolvedPart.endsWith('"')) {
                        try {
                            const quotedContent = evolvedPart.slice(1, -1);
                            evolvedNameInLine = quotedContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                        } catch (error) {
                            return line;
                        }
                    } else {
                        evolvedNameInLine = evolvedPart;
                    }

                    // Check if this is the evolved component we're renaming
                    if (normalizeComponentName(evolvedNameInLine) === normalizeComponentName(oldName)) {
                        // Format the new name appropriately
                        let formattedNewName = newName;
                        const needsQuotes =
                            newName.includes('\n') ||
                            newName.includes('"') ||
                            newName.includes("'") ||
                            newName.includes('\\') ||
                            newName.includes(' ');

                        if (needsQuotes) {
                            const escapedName = newName.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                            formattedNewName = `"${escapedName}"`;
                        }

                        // Reconstruct the evolve line with the new evolved name
                        const newEvolveLine = `evolve ${sourcePart}->${formattedNewName}${maturityPart}`;

                        updated = true;
                        return line.replace(trimmedLine, newEvolveLine);
                    }
                } else {
                    // Case 2: No arrow (evolve foo 0.9) - need to check if we're renaming the source component
                    // Parse the content to separate source name from maturity and optional label
                    const maturityPattern = /\s+([0-9]+(?:\.[0-9]+)?)(\s+label\s+\[[^\]]+\])?$/;
                    const maturityMatch = evolveContent.match(maturityPattern);

                    let sourceNamePart = '';
                    let maturityAndLabelPart = '';

                    if (maturityMatch) {
                        const maturityStartIndex = evolveContent.lastIndexOf(maturityMatch[0]);
                        sourceNamePart = evolveContent.substring(0, maturityStartIndex).trim();
                        maturityAndLabelPart = maturityMatch[0];
                    } else {
                        sourceNamePart = evolveContent;
                        maturityAndLabelPart = '';
                    }

                    // Extract source component name
                    let sourceNameInLine = '';
                    if (sourceNamePart.startsWith('"') && sourceNamePart.endsWith('"')) {
                        try {
                            const quotedContent = sourceNamePart.slice(1, -1);
                            sourceNameInLine = quotedContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                        } catch (error) {
                            return line;
                        }
                    } else {
                        sourceNameInLine = sourceNamePart;
                    }

                    // Check if this is the source component we're trying to rename the evolved version of
                    if (normalizeComponentName(sourceNameInLine) === normalizeComponentName(oldName)) {
                        // We found an evolve statement without an override, and the user is trying to rename
                        // the evolved component. We need to add the arrow syntax with the new name.

                        // Format the new name appropriately
                        let formattedNewName = newName;
                        const needsQuotes =
                            newName.includes('\n') ||
                            newName.includes('"') ||
                            newName.includes("'") ||
                            newName.includes('\\') ||
                            newName.includes(' ');

                        if (needsQuotes) {
                            const escapedName = newName.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                            formattedNewName = `"${escapedName}"`;
                        }

                        // Reconstruct the evolve line with the new override syntax
                        const newEvolveLine = `evolve ${sourceNamePart}->${formattedNewName}${maturityAndLabelPart}`;

                        updated = true;
                        return line.replace(trimmedLine, newEvolveLine);
                    }
                }

                return line;
            });

            if (!updated) {
                return {
                    success: false,
                    error: `Could not find evolved component "${oldName}" in the map text. Available evolve lines: ${lines
                        .filter(line => line.trim().startsWith('evolve '))
                        .map(line => line.trim())
                        .join(', ')}`,
                };
            }
            mutateMapText(updatedLines.join('\n'));
            return {success: true};
        } catch (error) {
            console.error('Error renaming evolved component:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred while renaming evolved component',
            };
        }
    };

    const handleSave = () => {
        // For evolved components, we need to check if the text has changed from the displayed name (override), not the source name
        let currentDisplayName = component.evolved ? component.override || component.name : component.name;

        // Handle quoted override names for evolved components
        if (component.evolved && component.override) {
            if (component.override.startsWith('"') && component.override.endsWith('"')) {
                currentDisplayName = component.override.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            } else {
                currentDisplayName = component.override;
            }
        }

        if (mutateMapText && mapText && text !== currentDisplayName && component.line) {
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

            let result: {success: boolean; error?: string};

            // Use different renaming logic for evolved components
            if (component.evolved) {
                // For evolved components, we need to distinguish between two cases:
                // 1. Has override (evolve foo->bar 0.9) - rename the evolved name "bar"
                // 2. No override (evolve foo 0.9) - add override syntax with new name

                if (component.override) {
                    // Case 1: Has override - rename the existing evolved name
                    let evolvedCurrentName = component.override;
                    if (evolvedCurrentName.startsWith('"') && evolvedCurrentName.endsWith('"')) {
                        // Remove outer quotes and unescape for matching
                        evolvedCurrentName = evolvedCurrentName
                            .slice(1, -1)
                            .replace(/\\"/g, '"')
                            .replace(/\\n/g, '\n')
                            .replace(/\\\\/g, '\\');
                    }
                    result = renameEvolvedComponent(evolvedCurrentName, text, mapText, mutateMapText);
                } else {
                    // Case 2: No override - need to add override syntax
                    // Pass the source component name so it can find "evolve sourceName maturity" and convert it to "evolve sourceName->newName maturity"
                    let sourceComponentName = component.name;
                    if (sourceComponentName.startsWith('"') && sourceComponentName.endsWith('"')) {
                        // Remove outer quotes and unescape for matching
                        sourceComponentName = sourceComponentName
                            .slice(1, -1)
                            .replace(/\\"/g, '"')
                            .replace(/\\n/g, '\n')
                            .replace(/\\\\/g, '\\');
                    }
                    result = renameEvolvedComponent(sourceComponentName, text, mapText, mutateMapText);
                }
            } else {
                result = rename(component.line, component.name, processedText, mapText, mutateMapText);
            }

            if (!result.success) {
                console.error('Failed to save component:', result.error);
                // Show localized user feedback instead of alert
                showUserFeedback(
                    originalT('components.saveError', {error: result.error}) || `Error saving component: ${result.error}`,
                    'error',
                );
                return; // Don't close the editor if save failed
            }
        }
        setEditMode(false);
        stopEditing();
    };

    const handleCancel = () => {
        const nameToDisplay = getDisplayText();
        setText(nameToDisplay);
        setEditMode(false);
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

        // Calculate cross-browser compatible position for the editor
        const componentPosition = {x: Number(cx), y: Number(cy)};
        const labelOffset = {x: getX(), y: getY()};
        const editorDimensions = {width: 140, height: editorHeight};
        const editorPosition = calculateComponentEditorPosition(componentPosition, labelOffset, editorDimensions);

        // Debug positioning in development
        debugPosition(
            'ComponentText Editor',
            {x: componentPosition.x + labelOffset.x, y: componentPosition.y + labelOffset.y},
            editorPosition,
        );

        return (
            <foreignObject
                x={editorPosition.x}
                y={editorPosition.y}
                width={editorPosition.width}
                height={editorPosition.height}
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

            // Support both evolve formats:
            // 1. "evolve ComponentName maturity [label]" (simple format)
            // 2. "evolve Source->Evolved maturity [label]" (arrow format)

            // Find the arrow position
            let arrowPos = -1;
            let inQuotes = false;
            let escapeNext = false;

            for (let i = 0; i < evolveContent.length - 1; i++) {
                const char = evolveContent[i];
                const nextChar = evolveContent[i + 1];

                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }

                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }

                if (char === '"') {
                    inQuotes = !inQuotes;
                    continue;
                }

                if (!inQuotes && char === '-' && nextChar === '>') {
                    arrowPos = i;
                    break;
                }
            }

            let evolvedNameInLine = '';

            if (arrowPos !== -1) {
                // Arrow format: "evolve Source->Evolved maturity [label]"
                const remainder = evolveContent.substring(arrowPos + 2).trim();

                // Parse the remainder to get evolved name (before maturity)
                const maturityPattern = /\s+([0-9]+(?:\.[0-9]+)?)(\s+label\s+\[[^\]]+\])?$/;
                const maturityMatch = remainder.match(maturityPattern);

                let evolvedPart = '';
                if (maturityMatch) {
                    const maturityStartIndex = remainder.lastIndexOf(maturityMatch[0]);
                    evolvedPart = remainder.substring(0, maturityStartIndex).trim();
                } else {
                    evolvedPart = remainder;
                }

                // Extract evolved component name
                if (evolvedPart.startsWith('"') && evolvedPart.endsWith('"')) {
                    // Extract quoted evolved name
                    const quotedContent = evolvedPart.slice(1, -1);
                    evolvedNameInLine = quotedContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                } else {
                    // Unquoted evolved name
                    evolvedNameInLine = evolvedPart;
                }
            } else {
                // Simple format: "evolve ComponentName maturity [label]"
                const maturityPattern = /\s+([0-9]+(?:\.[0-9]+)?)(\s+label\s+\[[^\]]+\])?$/;
                const maturityMatch = evolveContent.match(maturityPattern);

                let evolvedPart = '';
                if (maturityMatch) {
                    const maturityStartIndex = evolveContent.lastIndexOf(maturityMatch[0]);
                    evolvedPart = evolveContent.substring(0, maturityStartIndex).trim();
                } else {
                    evolvedPart = evolveContent;
                }

                // Extract evolved component name (same logic as above)
                if (evolvedPart.startsWith('"') && evolvedPart.endsWith('"')) {
                    const quotedContent = evolvedPart.slice(1, -1);
                    evolvedNameInLine = quotedContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                } else {
                    evolvedNameInLine = evolvedPart;
                }
            }

            // For evolved components, match against the evolved name (from override or name)
            let componentNameToMatch = component.name;
            if (component.evolved) {
                // Use override if available, otherwise fall back to component name
                componentNameToMatch = component.override || component.name;
                if (componentNameToMatch.startsWith('"') && componentNameToMatch.endsWith('"')) {
                    componentNameToMatch = componentNameToMatch
                        .slice(1, -1)
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\\\/g, '\\');
                }
            }

            // Use normalized matching to check if this is our evolved component
            if (normalizeComponentName(evolvedNameInLine) === normalizeComponentName(componentNameToMatch)) {
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

    // getDisplayText moved earlier, above state initialization

    const renderText = () => (
        <RelativeMovable
            id={`${component.id}-text-movable`}
            x={getX()}
            y={getY()}
            scaleFactor={scaleFactor} // Pass scale factor to RelativeMovable
            onMove={endDrag}>
            <ComponentTextSymbol
                id={`${component.id}-text`}
                text={getDisplayText()}
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
