import React, {useEffect, useState} from 'react';
import {useI18n} from '../../hooks/useI18n';
import {renameAnchor} from '../../constants/renameAnchor';
import {UnifiedComponent} from '../../types/unified';
import {createComponentNameValidator, DEFAULT_VALIDATION_OPTIONS} from '../../utils/componentNameValidation';
import {calculateComponentEditorPosition, debugPosition} from '../../utils/svgPositioning';
import {useEditing} from '../EditingContext';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import InlineEditor from './InlineEditor';
import {useUserFeedback} from './hooks/useUserFeedback';
import {MapTheme} from '../../types/map/styles';

interface AnchorTextProps {
    anchor: UnifiedComponent;
    cx: string | number;
    cy: string | number;
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    scaleFactor?: number;
    onClick?: (event: React.MouseEvent) => void;
}

const AnchorText: React.FC<AnchorTextProps> = ({
    anchor,
    cx,
    cy,
    mapText,
    mutateMapText,
    mapStyleDefs,
    scaleFactor = 1,
    onClick,
}) => {
    // Resolve the display text for the anchor (handles quoted names)
    const getDisplayText = () => {
        let name = anchor.name;

        // If the anchor name is quoted (multi-line or escaped), unescape it for display
        if (name && name.startsWith('"') && name.endsWith('"')) {
            name = name
                .slice(1, -1)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\\\/g, '\\');
        }

        return name;
    };

    const {enableDoubleClickRename} = useFeatureSwitches();
    const {startEditing, stopEditing, editingState} = useEditing();
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
    }, [anchor.name]);

    // Sync with EditingContext - respond to external editing requests (e.g., from context menu)
    useEffect(() => {
        // Use string comparison to handle type mismatch between string and number IDs
        const shouldBeEditing = editingState.isEditing && String(editingState.editingElementId) === String(anchor.id);

        if (shouldBeEditing && editingState.editingElementType === 'anchor' && !editMode) {
            setEditMode(true);
        } else if (!shouldBeEditing && editMode) {
            setEditMode(false);
        }
    }, [editingState.isEditing, editingState.editingElementId, editingState.editingElementType, anchor.id, editMode]);

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

        // Execute onClick if provided (e.g., to select the anchor)
        if (onClick && event) onClick(event);

        // Always attempt to start edit mode on double-click if feature is enabled
        if (enableDoubleClickRename && mapText && anchor.line) {
            setEditMode(true);
            startEditing(anchor.id, 'anchor');
        }
    };

    const handleSave = () => {
        const currentDisplayName = getDisplayText();

        if (mutateMapText && mapText && text !== currentDisplayName && anchor.line) {
            const result = renameAnchor(anchor.line, currentDisplayName, text, mapText, mutateMapText);

            if (!result.success) {
                console.error('Failed to save anchor:', result.error);
                // Show localized user feedback instead of alert
                showUserFeedback(
                    originalT('anchors.saveError', {error: result.error}) || `Error saving anchor: ${result.error}`, 
                    'error'
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

    const textFill = mapStyleDefs?.component?.textColor || '#000000';
    const fontSize = mapStyleDefs?.component?.fontSize || '14px';

    const renderEditMode = () => {
        // Always use the InlineEditor for consistent behavior across browsers
        // Default to multi-line (textarea) to encourage multi-line anchor names
        // Users can still create single-line names in textarea
        const isMultiLine = true; // Always use textarea for better multi-line support
        const editorHeight = 120; // Use consistent height for textarea

        // Calculate cross-browser compatible position for the editor
        const anchorPosition = {x: Number(cx), y: Number(cy)};
        const labelOffset = {x: 0, y: -10}; // Anchor text offset
        const editorDimensions = {width: 140, height: editorHeight};
        const editorPosition = calculateComponentEditorPosition(anchorPosition, labelOffset, editorDimensions);

        // Debug positioning in development
        debugPosition(
            'AnchorText Editor',
            {x: anchorPosition.x + labelOffset.x, y: anchorPosition.y + labelOffset.y},
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
                        placeholder={'Enter anchor name...\n(Ctrl+Enter to save)'}
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

    const renderText = () => (
        <ComponentTextSymbol
            id={`${anchor.id}-text`}
            text={getDisplayText()}
            x="0"
            y="-10"
            textAnchor="middle"
            evolved={false}
            textTheme={{
                fontSize: fontSize,
                fontWeight: 'normal',
                textColor: textFill,
                evolvedTextColor: textFill, // Anchors don't evolve, so use same color
            }}
            onDoubleClick={handleDoubleClick}
        />
    );

    return <>{editMode ? renderEditMode() : renderText()}</>;
};

export default AnchorText;
