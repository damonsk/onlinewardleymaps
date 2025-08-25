import React, {useEffect, useRef, useState} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../constants/mapstyles';
import {renameNote} from '../../constants/renameNote';
import {MapNotes} from '../../types/base';
import {createSelectionBoxDimensions, estimateTextDimensions, measureTextElement} from '../../utils/textMeasurement';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useEditing} from '../EditingContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import InlineEditor from './InlineEditor';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';
import {ModernExistingCoordsMatcher} from './positionUpdaters/ModernExistingCoordsMatcher';
import ModernLineNumberPositionUpdater from './positionUpdaters/ModernLineNumberPositionUpdater';
import {NotDefinedCoordsMatcher} from './positionUpdaters/NotDefinedCoordsMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface ModernNoteProps {
    note: MapNotes;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
    enableInlineEditing?: boolean;
}

const Note: React.FC<ModernNoteProps> = ({
    note,
    mapDimensions,
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    scaleFactor,
    enableInlineEditing = false,
}) => {
    const {startEditing, stopEditing, isElementEditing} = useEditing();
    const {isSelected, selectComponent} = useComponentSelection();
    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(note.text);
    const textElementRef = useRef<SVGTextElement>(null);
    const [selectionBoxDimensions, setSelectionBoxDimensions] = useState(() => {
        // Initial estimate based on text content
        const isMultiLine = note.text.includes('\n');
        const fontSize = parseInt(mapStyleDefs?.note?.fontSize || '14');
        const estimated = estimateTextDimensions(note.text, fontSize, mapStyleDefs?.fontFamily || 'Arial, sans-serif', isMultiLine);
        return createSelectionBoxDimensions(estimated, 6); // 6px padding
    });

    // Check if this note is currently selected
    const isElementSelected = isSelected(note.id);

    // Reset edit state when note changes
    React.useEffect(() => {
        setEditMode(false);
        setEditText(note.text);
        
        // Update selection box dimensions when text changes
        const isMultiLine = note.text.includes('\n');
        const fontSize = parseInt(mapStyleDefs?.note?.fontSize || '14');
        const estimated = estimateTextDimensions(note.text, fontSize, mapStyleDefs?.fontFamily || 'Arial, sans-serif', isMultiLine);
        setSelectionBoxDimensions(createSelectionBoxDimensions(estimated, 6));
    }, [note.id, note.text, mapStyleDefs]);

    // Measure actual text element dimensions after render
    useEffect(() => {
        if (textElementRef.current && !editMode) {
            // Use requestAnimationFrame to ensure the element is fully rendered
            requestAnimationFrame(() => {
                if (textElementRef.current) {
                    const measured = measureTextElement(textElementRef.current);
                    const boxDimensions = createSelectionBoxDimensions(measured, 6);
                    setSelectionBoxDimensions(boxDimensions);
                }
            });
        }
    }, [note.text, editMode, mapStyleDefs]);

    // Cleanup effect to handle component unmounting during editing
    React.useEffect(() => {
        return () => {
            if (editMode) {
                stopEditing(); // Clean up editing state if component is unmounted while editing
            }
        };
    }, [editMode, stopEditing]);

    const positionCalc = new ModernPositionCalculator();
    const positionUpdater = new ModernLineNumberPositionUpdater('note', mapText, mutateMapText, [
        ModernExistingCoordsMatcher,
        NotDefinedCoordsMatcher,
    ]);

    const x = (): number => positionCalc.maturityToX(note.maturity, mapDimensions.width);

    const y = (): number => positionCalc.visibilityToY(note.visibility, mapDimensions.height);

    function endDrag(moved: MovedPosition): void {
        const visibility = positionCalc.yToVisibility(moved.y, mapDimensions.height);
        const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
        positionUpdater.update({param1: parseFloat(visibility), param2: parseFloat(maturity)}, note.text, note.line);
    }

    const handleClick = (event: React.MouseEvent) => {
        selectComponent(note.id);
        setHighlightLine(note.line);
        event.stopPropagation();
    };

    const handleDoubleClick = () => {
        if (enableInlineEditing) {
            setEditMode(true);
            setEditText(note.text);
            startEditing(note.id, 'note');
        }
    };

    const handleSave = () => {
        if (editText.trim() !== note.text && editText.trim().length > 0) {
            const result = renameNote(note.line, note.text, editText.trim(), mapText, mutateMapText);
            if (!result.success) {
                console.error('Failed to save note:', result.error);
                // For now, just log the error. In a production app, you might show a toast notification
                // or keep the editor open to allow the user to retry
                alert(result.error); // Simple error notification - could be enhanced with a proper toast system
                return; // Don't close the editor if save failed
            }
        }
        setEditMode(false);
        stopEditing();
    };

    const handleCancel = () => {
        setEditText(note.text);
        setEditMode(false);
        stopEditing();
    };

    const renderEditMode = () => {
        // Browser-specific rendering fixes
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        const editorWidth = 140;
        const editorHeight = 80;

        if (isChrome) {
            // Chrome-specific rendering with local coordinate positioning
            // Since we're inside a Movable component with transform, use local coordinates (0,0)
            // and position the editor relative to the local origin
            const editorX = -editorWidth / 2;
            const editorY = -editorHeight / 2;

            return (
                <foreignObject
                    x={editorX}
                    y={editorY}
                    width={editorWidth}
                    height={editorHeight}
                    style={{
                        overflow: 'visible',
                        // Chrome-specific transform fixes
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                    }}>
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            display: 'block',
                            backgroundColor: 'white',
                            border: `2px solid ${mapStyleDefs?.component?.stroke || '#ccc'}`,
                            borderRadius: '4px',
                            padding: '4px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            zIndex: '1000',
                            boxSizing: 'border-box',
                            // Additional Chrome-specific fixes
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)',
                        }}>
                        <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => {
                                e.stopPropagation();
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancel();
                                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            onBlur={e => {
                                // Reset border color on blur
                                if (e.target.parentElement) {
                                    e.target.parentElement.style.border = `2px solid ${mapStyleDefs?.component?.stroke || '#ccc'}`;
                                }
                                handleSave();
                            }}
                            onFocus={e => {
                                e.target.select();
                                // Set focus border color to match InlineEditor
                                if (e.target.parentElement) {
                                    e.target.parentElement.style.border = `2px solid #007bff`;
                                }
                            }}
                            autoFocus
                            maxLength={500}
                            style={{
                                width: '100%',
                                height: 'calc(100% - 8px)', // Account for padding
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                fontFamily: mapStyleDefs?.fontFamily || 'Arial, sans-serif',
                                fontSize: mapStyleDefs?.note?.fontSize || '14px',
                                backgroundColor: 'transparent',
                                color: mapStyleDefs?.note?.textColor || 'black',
                                boxSizing: 'border-box',
                                // Chrome-specific text rendering fixes
                                WebkitFontSmoothing: 'antialiased',
                                MozOsxFontSmoothing: 'grayscale',
                            }}
                        />
                    </div>
                </foreignObject>
            );
        }

        // Default rendering for Safari and other browsers
        // Calculate proper positioning for the editor relative to note position
        const noteX = x();
        const noteY = y();
        const editorX = noteX - editorWidth / 2;
        const editorY = noteY - editorHeight / 2;

        return (
            <foreignObject
                x={editorX}
                y={editorY}
                width={editorWidth}
                height={editorHeight}
                style={{
                    overflow: 'visible',
                }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        display: 'block',
                        backgroundColor: 'transparent',
                    }}>
                    <InlineEditor
                        value={editText}
                        onChange={setEditText}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isMultiLine={true}
                        x={0}
                        y={0}
                        mapStyleDefs={mapStyleDefs}
                        autoFocus={true}
                        selectAllOnFocus={true}
                        validation={{
                            required: true,
                            maxLength: 500,
                        }}
                    />
                </div>
            </foreignObject>
        );
    };

    return (
        <>
            <Movable id={`modern_note_${note.id}`} onMove={endDrag} x={x()} y={y()} fixedY={false} fixedX={false} scaleFactor={scaleFactor}>
                <g
                    data-testid={`map-note-${note.id}`}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        filter: isElementSelected ? 'brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))' : 'none',
                    }}>
                    {/* Selection indicator background */}
                    {isElementSelected && (
                        <rect
                            x={selectionBoxDimensions.x}
                            y={selectionBoxDimensions.y}
                            width={selectionBoxDimensions.width}
                            height={selectionBoxDimensions.height}
                            fill="rgba(33, 150, 243, 0.1)"
                            stroke="#2196F3"
                            strokeWidth={1}
                            strokeOpacity={0.6}
                            strokeDasharray="3,2"
                            rx={4}
                            ry={4}
                            style={{
                                animation: 'noteSelectionPulse 2s ease-in-out infinite',
                            }}
                        />
                    )}

                    {/* Hover indicator for notes - rendered first so text appears above */}
                    <rect
                        className="note-hover-indicator"
                        x={selectionBoxDimensions.x}
                        y={selectionBoxDimensions.y}
                        width={selectionBoxDimensions.width}
                        height={selectionBoxDimensions.height}
                        fill="#87ceeb"
                        stroke="#2196F3"
                        strokeWidth={1}
                        rx={4}
                        ry={4}
                        style={{
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out',
                            pointerEvents: 'none',
                        }}
                    />

                    {editMode ? (
                        renderEditMode()
                    ) : (
                        <ComponentTextSymbol
                            ref={textElementRef}
                            id={`modern_note_text_${note.id}`}
                            note={note.text}
                            textTheme={mapStyleDefs?.note}
                            textAnchor="start"
                            onClick={handleClick}
                            onDoubleClick={handleDoubleClick}
                        />
                    )}
                </g>
            </Movable>

            {/* CSS animations for note selection */}
            <defs>
                <style>
                    {`
                    @keyframes noteSelectionPulse {
                      0%, 100% {
                        stroke-opacity: 0.4;
                      }
                      50% {
                        stroke-opacity: 0.8;
                      }
                    }
                    
                    @keyframes fadeIn {
                      0% {
                        opacity: 0;
                      }
                      40% {
                        opacity: 0.2;
                      }
                      100% {
                        opacity: 0.5;
                      }
                    }
                    
                    g[data-testid^="map-note-"]:hover .note-hover-indicator {
                      opacity: 0.5 !important;
                      animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                    `}
                </style>
            </defs>
        </>
    );
};

export default Note;
