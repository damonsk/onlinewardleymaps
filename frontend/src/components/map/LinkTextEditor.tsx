import React, {useCallback, useEffect, useState} from 'react';
import {useI18n} from '../../hooks/useI18n';
import {MapTheme} from '../../constants/mapstyles';
import {FlowLink} from '../../types/unified/links';
import {updateLinkContextText} from '../../utils/linkTextUpdate';
import InlineEditor from './InlineEditor';

interface LinkTextEditorProps {
    link: FlowLink;
    x: number;
    y: number;
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    onSave: () => void;
    onCancel: () => void;
    autoFocus?: boolean;
}

const LinkTextEditor: React.FC<LinkTextEditorProps> = ({
    link,
    x,
    y,
    mapText,
    mutateMapText,
    mapStyleDefs,
    onSave,
    onCancel,
    autoFocus = true,
}) => {
    const {t} = useI18n();
    const [editValue, setEditValue] = useState(link.context || '');
    const [validationError, setValidationError] = useState<string | null>(null);

    // Reset edit value when link changes
    useEffect(() => {
        setEditValue(link.context || '');
        setValidationError(null);
    }, [link.context]);

    const handleSave = useCallback(() => {
        // Validate input
        const trimmedValue = editValue.trim();

        // Check for line breaks (not allowed)
        if (trimmedValue.includes('\n') || trimmedValue.includes('\r')) {
            setValidationError(t('editor.link.validation.noLineBreaks', 'Link text cannot contain line breaks'));
            return;
        }

        // Check for characters that could break link syntax
        if (trimmedValue.includes(';')) {
            setValidationError(t('editor.link.validation.noSemicolons', 'Link text cannot contain semicolons'));
            return;
        }

        try {
            const {mapText: updatedMapText, result} = updateLinkContextText(mapText, link, trimmedValue);

            if (result.success) {
                mutateMapText(updatedMapText);
                onSave();
            } else {
                setValidationError(result.error || t('editor.link.validation.updateFailed', 'Failed to update link text'));
            }
        } catch (error) {
            setValidationError(
                error instanceof Error ? error.message : t('editor.link.validation.unexpectedError', 'An unexpected error occurred'),
            );
        }
    }, [editValue, mapText, link, mutateMapText, onSave, t]);

    const handleCancel = useCallback(() => {
        setEditValue(link.context || '');
        setValidationError(null);
        onCancel();
    }, [link.context, onCancel]);

    const handleChange = useCallback((value: string) => {
        setEditValue(value);
        setValidationError(null);
    }, []);

    const customValidator = useCallback(
        (value: string): string | null => {
            const trimmedValue = value.trim();

            if (trimmedValue.includes('\n') || trimmedValue.includes('\r')) {
                return t('editor.link.validation.noLineBreaks', 'Link text cannot contain line breaks');
            }

            if (trimmedValue.includes(';')) {
                return t('editor.link.validation.noSemicolons', 'Link text cannot contain semicolons');
            }

            return null;
        },
        [t],
    );

    return (
        <InlineEditor
            value={editValue}
            onChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            isMultiLine={false}
            placeholder={t('editor.link.placeholder', 'Enter link text...')}
            x={x}
            y={y}
            width={150}
            minWidth={100}
            fontSize={mapStyleDefs.link?.contextFontSize ?? '10px'}
            fontFamily={mapStyleDefs.fontFamily}
            mapStyleDefs={mapStyleDefs}
            autoFocus={autoFocus}
            selectAllOnFocus={true}
            validation={{
                customValidator,
                sanitizeInput: true,
                maxLength: 100,
                warningThreshold: 80,
                allowedCharacters: /^[^;\n\r]*$/,
            }}
            realTimeValidation={true}
            showCharacterCount={true}
            ariaLabel={`Edit link text for ${link.start} to ${link.end}`}
            ariaDescription={t(
                'editor.link.ariaDescription',
                'Enter text to display on the link. Cannot contain line breaks or semicolons.',
            )}
        />
    );
};

export default LinkTextEditor;
