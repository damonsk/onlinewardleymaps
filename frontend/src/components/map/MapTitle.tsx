import React, {useCallback, useState} from 'react';
import {useI18n} from '../../hooks/useI18n';
import {MapTheme} from '../../types/map/styles';
import {calculateTitleEditorPosition, debugPosition} from '../../utils/svgPositioning';
import InlineEditor from './InlineEditor';

interface MapTitleProps {
    mapTitle: string;
    mapText?: string;
    onTitleUpdate?: (newTitle: string) => void;
    mapStyleDefs?: MapTheme;
    isEditable?: boolean;
}

function MapTitle(props: MapTitleProps) {
    const TITLE_EDITOR_WIDTH = 300;
    const TITLE_EDITOR_HEIGHT = 70; // Includes space for inline editor action buttons rendered below the input

    const {mapTitle, mapText, onTitleUpdate, mapStyleDefs, isEditable = true} = props;
    const {t} = useI18n();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(mapTitle);

    const handleDoubleClick = useCallback(() => {
        if (isEditable && onTitleUpdate) {
            setEditValue(mapTitle);
            setIsEditing(true);
        }
    }, [isEditable, onTitleUpdate, mapTitle]);

    const handleSave = useCallback(() => {
        if (onTitleUpdate && editValue.trim() !== mapTitle) {
            onTitleUpdate(editValue.trim());
        }
        setIsEditing(false);
    }, [onTitleUpdate, editValue, mapTitle]);

    const handleCancel = useCallback(() => {
        setEditValue(mapTitle);
        setIsEditing(false);
    }, [mapTitle]);

    const handleChange = useCallback((value: string) => {
        setEditValue(value);
    }, []);

    if (isEditing && mapStyleDefs) {
        // Calculate cross-browser compatible position for the editor
        const titlePosition = {x: 0, y: -10}; // Position of the title text
        const editorDimensions = {width: TITLE_EDITOR_WIDTH, height: TITLE_EDITOR_HEIGHT};
        const editorPosition = calculateTitleEditorPosition(titlePosition, editorDimensions);

        // Debug positioning in development
        debugPosition('MapTitle Editor', titlePosition, editorPosition);

        return (
            <foreignObject
                x={editorPosition.x}
                y={editorPosition.y}
                width={editorPosition.width}
                height={editorPosition.height}
                style={{overflow: 'visible', pointerEvents: 'auto'}}>
                <InlineEditor
                    value={editValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    showActionButtons={true}
                    x={0}
                    y={0}
                    fontSize="20px"
                    fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
                    mapStyleDefs={mapStyleDefs}
                    autoFocus={true}
                    selectAllOnFocus={true}
                    placeholder={t('map.title.placeholder', 'Enter map title')}
                    validation={{
                        required: true,
                        maxLength: 200,
                        minLength: 1,
                    }}
                    ariaLabel={t('map.title.ariaLabel', 'Edit map title')}
                />
            </foreignObject>
        );
    }

    return (
        <text
            x={0}
            y={-10}
            id={'mapTitle'}
            fontWeight={'bold'}
            fontSize={'20px'}
            fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
            onDoubleClick={handleDoubleClick}
            style={{
                cursor: isEditable && onTitleUpdate ? 'pointer' : 'default',
            }}>
            {mapTitle}
        </text>
    );
}

export default MapTitle;
