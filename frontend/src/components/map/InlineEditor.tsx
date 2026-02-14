import React, {useCallback, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {useI18n} from '../../hooks/useI18n';
import {MapTheme} from '../../types/map/styles';
import {hasSafariSVGQuirks} from '../../utils/browserDetection';

interface ValidationConfig {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
    sanitizeInput?: boolean;
    allowedCharacters?: RegExp;
    forbiddenCharacters?: RegExp;
    warningThreshold?: number; // Show warning when approaching maxLength
}

export interface InlineEditorProps {
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isMultiLine?: boolean;
    placeholder?: string;
    x: number;
    y: number;
    width?: number;
    minWidth?: number;
    maxHeight?: number;
    minHeight?: number;
    fontSize?: string;
    fontFamily?: string;
    mapStyleDefs: MapTheme;
    autoFocus?: boolean;
    selectAllOnFocus?: boolean;
    validation?: ValidationConfig;
    realTimeValidation?: boolean;
    showCharacterCount?: boolean;
    autoResize?: boolean;
    ariaLabel?: string;
    ariaDescription?: string;
    safariFixedPosition?: {x: number; y: number};
    showActionButtons?: boolean;
}

interface StyledEditorProps {
    $width?: number;
    $minWidth?: number;
    $maxHeight?: number;
    $minHeight?: number;
    $fontSize?: string;
    $fontFamily?: string;
    $theme: MapTheme;
    $hasError?: boolean;
    $hasWarning?: boolean;
    $isMultiLine?: boolean;
    $autoResize?: boolean;
    $dynamicHeight?: number;
}

const EditorContainer = styled.div<StyledEditorProps>`
    position: ${() => (hasSafariSVGQuirks() ? 'fixed' : 'relative')};
    display: block;
    min-width: ${props => props.$minWidth || 120}px;
    width: ${props => (props.$width ? `${props.$width}px` : 'auto')};
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background-color: transparent;
    z-index: 1000;

    @media (max-width: 768px) {
        min-width: ${props => Math.min(props.$minWidth || 120, 100)}px;
        width: ${props => (props.$width ? `${Math.min(props.$width, 200)}px` : 'auto')};
    }

    @media (max-width: 480px) {
        min-width: 80px;
        width: ${props => (props.$width ? `${Math.min(props.$width, 150)}px` : 'auto')};
    }
`;

const StyledInput = styled.input<StyledEditorProps>`
    width: 100%;
    min-width: ${props => props.$minWidth || 120}px;
    padding: 4px 8px;
    margin: 0;
    border: 2px solid ${props => (props.$hasError ? '#ff4444' : props.$hasWarning ? '#ffaa00' : props.$theme.component?.stroke || '#ccc')};
    border-radius: 4px;
    background-color: ${props => props.$theme.component?.fill || 'white'};
    color: ${props => props.$theme.component?.textColor || 'black'};
    font-family: ${props => props.$fontFamily || props.$theme.fontFamily || 'Arial, sans-serif'};
    font-size: ${props => props.$fontSize || props.$theme.component?.fontSize || '14px'};
    font-weight: ${props => props.$theme.component?.fontWeight || 'normal'};

    @media (max-width: 768px) {
        font-size: ${props => {
            const baseFontSize = parseInt(props.$fontSize || props.$theme.component?.fontSize || '14', 10);
            return `${Math.max(baseFontSize - 1, 12)}px`;
        }};
    }

    @media (max-width: 480px) {
        font-size: ${props => {
            const baseFontSize = parseInt(props.$fontSize || props.$theme.component?.fontSize || '14', 10);
            return `${Math.max(baseFontSize - 2, 11)}px`;
        }};
    }
    outline: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    -webkit-appearance: none;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    position: relative;
    z-index: 1;

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
        outline: 2px solid transparent;
        outline-offset: 2px;
    }

    @media (prefers-contrast: high) {
        &:focus {
            outline: 2px solid ${props => props.$theme.component?.evolved || '#007bff'};
            outline-offset: 2px;
        }
    }

    &::placeholder {
        color: ${props => props.$theme.component?.textColor || '#999'};
        opacity: 0.7;
    }
`;

const StyledTextarea = styled.textarea<StyledEditorProps>`
    width: 100%;
    min-width: ${props => props.$minWidth || 120}px;
    min-height: ${props => props.$minHeight || 60}px;
    max-height: ${props => (props.$maxHeight ? `${props.$maxHeight}px` : 'none')};
    height: ${props => (props.$autoResize && props.$dynamicHeight ? `${props.$dynamicHeight}px` : 'auto')};
    padding: 4px 8px;
    margin: 0;
    border: 2px solid ${props => (props.$hasError ? '#ff4444' : props.$hasWarning ? '#ffaa00' : props.$theme.component?.stroke || '#ccc')};
    border-radius: 4px;
    background-color: ${props => props.$theme.component?.fill || 'white'};
    color: ${props => props.$theme.component?.textColor || 'black'};
    font-family: ${props => props.$fontFamily || props.$theme.fontFamily || 'Arial, sans-serif'};
    font-size: ${props => props.$fontSize || props.$theme.component?.fontSize || '14px'};
    font-weight: ${props => props.$theme.component?.fontWeight || 'normal'};

    @media (max-width: 768px) {
        font-size: ${props => {
            const baseFontSize = parseInt(props.$fontSize || props.$theme.component?.fontSize || '14', 10);
            return `${Math.max(baseFontSize - 1, 12)}px`;
        }};
    }

    @media (max-width: 480px) {
        font-size: ${props => {
            const baseFontSize = parseInt(props.$fontSize || props.$theme.component?.fontSize || '14', 10);
            return `${Math.max(baseFontSize - 2, 11)}px`;
        }};
    }
    line-height: 1.4;
    outline: none;
    resize: ${props => (props.$autoResize ? 'none' : 'vertical')};
    overflow-y: ${props => (props.$maxHeight ? 'auto' : 'hidden')};
    white-space: pre-wrap;
    word-wrap: break-word;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        height 0.1s ease;
    -webkit-appearance: none;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    position: relative;
    z-index: 1;

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
        outline: 2px solid transparent;
        outline-offset: 2px;
    }

    @media (prefers-contrast: high) {
        &:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
        }
    }

    &::placeholder {
        color: ${props => props.$theme.component?.textColor || '#999'};
        opacity: 0.7;
    }
`;

const ErrorMessage = styled.div<{$theme: MapTheme; $offsetBelowControls?: boolean}>`
    position: absolute;
    top: ${props => (props.$offsetBelowControls ? 'calc(100% + 24px)' : '100%')};
    left: 0;
    right: 0;
    margin-top: 2px;
    padding: 2px 4px;
    background-color: #ff4444;
    color: white;
    font-size: 11px;
    border-radius: 2px;
    z-index: 1000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CharacterCounter = styled.div<{$theme: MapTheme; $isWarning?: boolean; $isError?: boolean}>`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 2px;
    padding: 2px 4px;
    background-color: ${props => (props.$isError ? '#ff4444' : props.$isWarning ? '#ffaa00' : '#666')};
    color: white;
    font-size: 10px;
    border-radius: 2px;
    z-index: 1000;
`;

const ActionButtons = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 2px;
    display: flex;
    gap: 4px;
    z-index: 1001;
`;

const ActionButton = styled.button<{$theme: MapTheme; $variant: 'save' | 'cancel'}>`
    border: 1px solid ${props => props.$theme.component?.stroke || '#ccc'};
    background-color: ${props => (props.$variant === 'save' ? '#2e7d32' : '#f5f5f5')};
    color: ${props => (props.$variant === 'save' ? '#fff' : props.$theme.component?.textColor || '#222')};
    border-radius: 3px;
    padding: 1px 6px;
    font-size: 11px;
    line-height: 1.2;
    cursor: pointer;

    &:hover {
        filter: brightness(0.95);
    }

    &:focus {
        outline: 2px solid #007bff;
        outline-offset: 1px;
    }
`;

const InlineEditor: React.FC<InlineEditorProps> = ({
    value,
    onChange,
    onSave,
    onCancel,
    isMultiLine = false,
    placeholder,
    x,
    y,
    width,
    minWidth = 120,
    maxHeight,
    minHeight = 60,
    fontSize,
    fontFamily,
    mapStyleDefs,
    autoFocus = true,
    selectAllOnFocus = true,
    validation,
    realTimeValidation = true,
    showCharacterCount = true,
    autoResize = true,
    ariaLabel,
    ariaDescription,
    showActionButtons,
}) => {
    const {t, originalT} = useI18n();
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showRealTimeValidation, setShowRealTimeValidation] = useState(false);
    const [dynamicHeight, setDynamicHeight] = useState<number | undefined>(undefined);
    const shouldShowActionButtons = showActionButtons ?? isMultiLine;

    // Calculate dynamic height for auto-resize
    const calculateHeight = useCallback(() => {
        if (!isMultiLine || !autoResize || !inputRef.current) return;

        const textarea = inputRef.current as HTMLTextAreaElement;
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

        // Reset height to auto to get the natural scroll height
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;

        // Calculate the content height
        const contentHeight = scrollHeight - paddingTop - paddingBottom;
        const lines = Math.max(1, Math.ceil(contentHeight / lineHeight));

        // Calculate new height with padding and borders
        let newHeight = lines * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;

        // Apply min and max height constraints
        if (minHeight) {
            newHeight = Math.max(newHeight, minHeight);
        }
        if (maxHeight) {
            newHeight = Math.min(newHeight, maxHeight);
        }

        setDynamicHeight(newHeight);
    }, [isMultiLine, autoResize, minHeight, maxHeight]);

    // Auto-resize effect
    useEffect(() => {
        if (isMultiLine && autoResize) {
            calculateHeight();
        }
    }, [value, calculateHeight, isMultiLine, autoResize]);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            // Use setTimeout to ensure the element is fully rendered before focusing
            const timeoutId = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    if (selectAllOnFocus && typeof inputRef.current.select === 'function') {
                        inputRef.current.select();
                    }
                    // Calculate height after focus for multi-line
                    if (isMultiLine && autoResize) {
                        calculateHeight();
                    }
                }
            }, 0);

            // Cleanup timeout on unmount or dependency change
            return () => clearTimeout(timeoutId);
        }
    }, [autoFocus, selectAllOnFocus, isMultiLine, autoResize, calculateHeight]);

    const sanitizeInput = (val: string): string => {
        if (!validation?.sanitizeInput) return val;

        let sanitized = val;

        // Remove forbidden characters if specified
        if (validation.forbiddenCharacters) {
            sanitized = sanitized.replace(validation.forbiddenCharacters, '');
        }

        // Keep only allowed characters if specified
        if (validation.allowedCharacters) {
            const matches = sanitized.match(validation.allowedCharacters);
            sanitized = matches ? matches.join('') : '';
        }

        return sanitized;
    };

    const validateValue = (val: string): string | null => {
        if (!validation) return null;

        if (validation.required && val.trim().length === 0) {
            return t('editor.inline.validation.required', 'This field is required');
        }

        if (validation.minLength && val.length < validation.minLength) {
            return (
                originalT('editor.inline.validation.minLength', {count: validation.minLength}) ||
                `Minimum length is ${validation.minLength} characters`
            );
        }

        if (validation.maxLength && val.length > validation.maxLength) {
            return (
                originalT('editor.inline.validation.maxLength', {count: validation.maxLength}) ||
                `Maximum length is ${validation.maxLength} characters`
            );
        }

        if (validation.pattern && !validation.pattern.test(val)) {
            return t('editor.inline.validation.invalidFormat', 'Invalid format');
        }

        // Check for forbidden characters (if not sanitizing)
        if (!validation.sanitizeInput && validation.forbiddenCharacters && validation.forbiddenCharacters.test(val)) {
            return t('editor.inline.validation.invalidCharacters', 'Contains invalid characters');
        }

        // Check for allowed characters (if not sanitizing)
        if (!validation.sanitizeInput && validation.allowedCharacters && !validation.allowedCharacters.test(val)) {
            return t('editor.inline.validation.invalidCharacters', 'Contains invalid characters');
        }

        if (validation.customValidator) {
            return validation.customValidator(val);
        }

        return null;
    };

    const checkWarning = (val: string): boolean => {
        if (!validation?.warningThreshold || !validation?.maxLength) return false;
        return val.length >= validation.warningThreshold;
    };

    // Calculate warning state based on current value
    const hasWarning = checkWarning(value) && !validateValue(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let newValue = e.target.value;

        // Sanitize input if enabled
        if (validation?.sanitizeInput) {
            newValue = sanitizeInput(newValue);
        }

        onChange(newValue);

        // Always run validation on every change if realTimeValidation is true
        if (realTimeValidation) {
            const error = validateValue(newValue);
            setValidationError(error);
        } else if (validationError) {
            // Clear validation error when user starts typing (when not in real-time mode)
            setValidationError(null);
        }

        // Trigger height recalculation for multi-line auto-resize
        if (isMultiLine && autoResize) {
            // Use setTimeout to ensure the DOM is updated with the new value
            setTimeout(() => calculateHeight(), 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Always stop propagation to prevent map interactions during editing
        e.stopPropagation();

        // Handle Escape key - always cancels editing
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
            return;
        }

        // Handle save shortcuts
        if (isMultiLine) {
            // For multi-line: Ctrl+Enter or Cmd+Enter saves, Enter creates new line
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSave();
                return;
            }
        } else {
            // For single-line: Enter saves
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
                return;
            }
        }

        // Allow navigation keys to work normally for text editing
        const navigationKeys = [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'PageUp',
            'PageDown',
            'Backspace',
            'Delete',
            'Tab',
        ];

        // Allow text selection shortcuts
        const textSelectionKeys = ['a', 'c', 'v', 'x', 'z', 'y'];
        const isTextSelectionShortcut = textSelectionKeys.includes(e.key.toLowerCase()) && (e.ctrlKey || e.metaKey);

        // Allow navigation keys and text selection shortcuts to work normally
        if (navigationKeys.includes(e.key) || isTextSelectionShortcut) {
            // Don't prevent default for these keys - let them work normally
            return;
        }

        // For all other keys, let them work normally for text input
        // The stopPropagation above ensures map shortcuts don't interfere
    };

    const handleSave = () => {
        const error = validateValue(value);
        if (error) {
            setValidationError(error);
            setShowRealTimeValidation(true); // Enable real-time validation after first save attempt
            return;
        }

        try {
            setValidationError(null);
            onSave();
        } catch (err) {
            console.error('Error during save:', err);
            setValidationError(t('editor.inline.validation.saveFailed', 'Failed to save. Please try again.'));
            // Keep the editor open for retry
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Always stop propagation to prevent map interactions during editing
        e.stopPropagation();
    };

    const handleBlur = () => {
        // Auto-save on blur if no validation errors
        const error = validateValue(value);
        if (!error) {
            try {
                onSave();
            } catch (err) {
                console.error('Error during auto-save on blur:', err);
                // Keep the editor open if save fails
                if (inputRef.current && typeof inputRef.current.focus === 'function') {
                    inputRef.current.focus();
                }
            }
        } else {
            setValidationError(error);
            setShowRealTimeValidation(true); // Enable real-time validation after blur with error
        }
    };

    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
    };

    const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Handle focus event for additional text selection if needed
        if (selectAllOnFocus && e.target.value) {
            e.target.select();
        }
    };

    const commonProps = {
        ref: inputRef as any,
        value,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp,
        onBlur: handleBlur,
        onFocus: handleFocus,
        placeholder,
        'aria-label':
            ariaLabel ||
            t(
                isMultiLine ? 'editor.inline.ariaLabel.multiLine' : 'editor.inline.ariaLabel.singleLine',
                isMultiLine ? 'Multi-line text editor' : 'Text editor',
            ),
        'aria-describedby': ariaDescription || validationError ? 'inline-editor-description' : undefined,
        'aria-invalid': !!validationError,
        'aria-required': validation?.required || false,
        $width: width,
        $minWidth: minWidth,
        $maxHeight: maxHeight,
        $minHeight: minHeight,
        $fontSize: fontSize,
        $fontFamily: fontFamily,
        $theme: mapStyleDefs,
        $hasError: !!validationError,
        $hasWarning: hasWarning,
        $isMultiLine: isMultiLine,
        $autoResize: autoResize,
        $dynamicHeight: dynamicHeight,
    };

    const hasBottomControls = shouldShowActionButtons || !!(showCharacterCount && validation?.maxLength);

    return (
        <EditorContainer
            data-testid="inline-editor"
            $width={width}
            $minWidth={minWidth}
            $maxHeight={maxHeight}
            $minHeight={minHeight}
            $fontSize={fontSize}
            $fontFamily={fontFamily}
            $theme={mapStyleDefs}
            $autoResize={autoResize}
            $dynamicHeight={dynamicHeight}>
            {isMultiLine ? (
                <StyledTextarea {...commonProps} data-testid="inline-editor-input" />
            ) : (
                <StyledInput {...commonProps} data-testid="inline-editor-input" />
            )}
            {validationError && (
                <ErrorMessage $theme={mapStyleDefs} $offsetBelowControls={hasBottomControls} id="inline-editor-description" role="alert">
                    {validationError}
                </ErrorMessage>
            )}
            {showCharacterCount && validation?.maxLength && (
                <CharacterCounter
                    $theme={mapStyleDefs}
                    $isWarning={hasWarning && !validationError}
                    $isError={!!validationError && validationError.includes('Maximum length')}>
                    {value.length}/{validation.maxLength}
                </CharacterCounter>
            )}
            {shouldShowActionButtons && (
                <ActionButtons>
                    <ActionButton
                        type="button"
                        $theme={mapStyleDefs}
                        $variant="save"
                        onMouseDown={e => e.preventDefault()}
                        onClick={handleSaveClick}
                        aria-label={t('editor.inline.actions.save', 'Save changes')}
                        title={t('editor.inline.actions.saveTitle', 'Save')}>
                        OK
                    </ActionButton>
                    <ActionButton
                        type="button"
                        $theme={mapStyleDefs}
                        $variant="cancel"
                        onMouseDown={e => e.preventDefault()}
                        onClick={handleCancelClick}
                        aria-label={t('editor.inline.actions.cancel', 'Cancel changes')}
                        title={t('editor.inline.actions.cancelTitle', 'Cancel')}>
                        X
                    </ActionButton>
                </ActionButtons>
            )}
        </EditorContainer>
    );
};

export default InlineEditor;
