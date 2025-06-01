import TextareaAutosize from '@mui/material/TextareaAutosize';
import React, { useEffect, useRef, useState } from 'react';
import { rename } from '../../constants/rename';
import { UnifiedComponent } from '../../types/unified';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import RelativeMovable from './RelativeMovable';

interface MovedPosition {
    x: number;
    y: number;
}

/**
 * ModernComponentText Props
 * Uses UnifiedComponent directly instead of ComponentElement
 */
interface ModernComponentTextProps {
    component: UnifiedComponent; // Using UnifiedComponent directly
    cx: string | number;
    cy: string | number;
    styles: any;
    valueChain?: string;
    mutateMapText?: (newText: string) => void;
    mapText?: string;
}

/**
 * ModernComponentText
 * Phase 4A: Component Interface Modernization
 * This component accepts UnifiedComponent directly without adapters
 */
const ModernComponentText: React.FC<ModernComponentTextProps> = ({
    component,
    cx,
    cy,
    styles,
    valueChain,
    mutateMapText,
    mapText,
}) => {
    const { enableRenameLabels } = useFeatureSwitches();
    const [editMode, setEditMode] = useState(false);
    const [text, setText] = useState(component.name);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setText(component.name);
    }, [component.name]);

    useEffect(() => {
        if (editMode && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [editMode]);

    const handleDoubleClick = () => {
        if (enableRenameLabels && mutateMapText && mapText) {
            setEditMode(true);
        }
    };

    const handleBlur = () => {
        setEditMode(false);
        if (mutateMapText && mapText && text !== component.name) {
            const updatedText = rename(mapText, component.name, text);
            mutateMapText(updatedText);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setEditMode(false);
            if (mutateMapText && mapText && text !== component.name) {
                const updatedText = rename(mapText, component.name, text);
                mutateMapText(updatedText);
            }
        }
    };

    // Calculate label position
    const getX = () => {
        return component.label?.x || 0;
    };

    const getY = () => {
        return (
            (component.label?.y || 0) + (component.increaseLabelSpacing || 0)
        );
    };

    const updatePosition = (movedPosition: MovedPosition) => {
        // Implementation for position updates if needed
    };

    const textFill = component.evolved ? styles.evolvedText : styles.text;
    const fontSize = styles?.fontSize || '14px';

    const renderEditMode = () => (
        <foreignObject
            x={Number(cx) + getX() - 50}
            y={Number(cy) + getY() - 25}
            width="100"
            height="50"
            style={{ overflow: 'visible' }}
        >
            <TextareaAutosize
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{
                    width: '100%',
                    resize: 'none',
                    fontFamily: 'Arial',
                    fontSize: fontSize,
                    border: '1px solid #ccc',
                    padding: '2px',
                }}
            />
        </foreignObject>
    );

    const renderText = () => (
        <RelativeMovable x={getX()} y={getY()}>
            <ComponentTextSymbol
                id={`${component.id}-text`}
                text={component.name}
                cx={cx}
                cy={cy}
                fill={textFill}
                fontSize={fontSize}
                onDoubleClick={handleDoubleClick}
            />
        </RelativeMovable>
    );

    return <>{editMode ? renderEditMode() : renderText()}</>;
};

export default ModernComponentText;
