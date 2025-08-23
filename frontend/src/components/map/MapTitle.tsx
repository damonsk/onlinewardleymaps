import { useCallback, useState } from 'react';
import { MapTheme } from '../../types/map/styles';
import InlineEditor from './InlineEditor';

interface MapTitleProps {
    mapTitle: string;
    mapText?: string;
    onTitleUpdate?: (newTitle: string) => void;
    mapStyleDefs?: MapTheme;
    isEditable?: boolean;
}

function MapTitle(props: MapTitleProps) {
    const {mapTitle, mapText, onTitleUpdate, mapStyleDefs, isEditable = true} = props;
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
        return (
            <foreignObject x={0} y={-35} width={300} height={40}>
                <InlineEditor
                    value={editValue}
                    onChange={handleChange}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    x={0}
                    y={0}
                    fontSize="20px"
                    fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
                    mapStyleDefs={mapStyleDefs}
                    autoFocus={true}
                    selectAllOnFocus={true}
                    placeholder="Enter map title"
                    validation={{
                        required: true,
                        maxLength: 200,
                        minLength: 1,
                    }}
                    ariaLabel="Edit map title"
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
            }}
            title={isEditable && onTitleUpdate ? 'Double-click to edit title' : undefined}>
            {mapTitle}
        </text>
    );
}

export default MapTitle;
