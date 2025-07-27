import React, {useEffect, useState} from 'react';
import {rename} from '../../constants/rename';
import {UnifiedComponent} from '../../types/unified';
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

    const actualComponent = element
        ? {
              name: element.name,
          }
        : component;

    const [text, setText] = useState(actualComponent.name);

    useEffect(() => {
        setText(actualComponent.name);
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
            const result = rename(component.line, component.name, text, mapText, mutateMapText);
            if (!result.success) {
                console.error('Failed to save component:', result.error);
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
        setText(actualComponent.name);
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
        // Safari fallback - use native input instead of styled-components
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isSafari) {
            return (
                <foreignObject x={Number(cx) + getX() - 60} y={Number(cy) + getY() - 30} width="140" height="50">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSave();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancel();
                            }
                        }}
                        onBlur={handleSave}
                        onFocus={e => {
                            // Select all text on focus for easy replacement
                            e.target.select();
                        }}
                        autoFocus
                        maxLength={100}
                        style={{
                            width: '120px',
                            padding: '4px 8px',
                            margin: '0',
                            border: '2px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: 'black',
                            fontSize: fontSize,
                            fontFamily: 'Arial, sans-serif',
                            outline: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            // Safari-specific fixes
                            WebkitAppearance: 'none',
                            appearance: 'none',
                        }}
                    />
                </foreignObject>
            );
        }

        // Chrome and other browsers - use the full InlineEditor
        return (
            <foreignObject
                x={Number(cx) + getX() - 60}
                y={Number(cy) + getY() - 30}
                width="140"
                height="80"
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
                        onChange={setText}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        x={0}
                        y={0}
                        width={120}
                        fontSize={fontSize}
                        mapStyleDefs={mapStyleDefs}
                        autoFocus={true}
                        selectAllOnFocus={true}
                        validation={{
                            required: true,
                            maxLength: 100,
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
