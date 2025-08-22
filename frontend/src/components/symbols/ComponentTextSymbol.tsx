import React, {memo} from 'react';
import {TextTheme} from '../../constants/mapstyles';

export interface ComponentTextSymbolProps {
    id: string;
    x?: string;
    y?: string;
    text?: string;
    textTheme: TextTheme;
    fill?: string;
    fontWeight?: string;
    className?: string;
    evolved?: boolean;
    onClick?: (e: React.MouseEvent<SVGTextElement, MouseEvent>) => void;
    onDoubleClick?: (e: React.MouseEvent<SVGTextElement, MouseEvent>) => void;
    note?: string;
    textAnchor?: string;
    setShowTextField?: (value: React.SetStateAction<boolean>) => void;
}

const ComponentTextSymbol: React.FunctionComponent<ComponentTextSymbolProps> = ({
    id,
    x,
    y,
    text,
    evolved,
    className = 'label',
    note,
    textAnchor,
    textTheme,
    onClick,
    onDoubleClick,
    setShowTextField = null,
}) => {
    const renderMultiLineText = (id: string, textContent: string) => {
        // Split by actual line breaks (\n) only - no word wrapping for multi-line content
        const lines = textContent.split('\n');
        const tspans: JSX.Element[] = [];

        // Use the textAnchor prop if provided, otherwise default to 'middle' for proper centering
        const anchor = textAnchor || 'middle';

        lines.forEach((line, lineIndex) => {
            if (line === '') {
                // Handle empty lines by adding a space to maintain line spacing
                tspans.push(
                    <tspan key={`${id}_line_${lineIndex}_empty`} x={0} dy={lineIndex === 0 ? 0 : 15} textAnchor={anchor}>
                        {' '}
                    </tspan>,
                );
            } else {
                // Render each line as a single tspan - no word wrapping
                tspans.push(
                    <tspan key={`${id}_line_${lineIndex}`} x={0} dy={lineIndex === 0 ? 0 : 15} textAnchor={anchor}>
                        {line}
                    </tspan>,
                );
            }
        });

        return tspans;
    };

    const trimText = (id: string, longText: string) =>
        longText
            .trim()
            .split(' ')
            .map((text, i) => (
                <tspan key={'component_text_span_' + id + '_' + i} x={0} dy={i > 0 ? 15 : 0} textAnchor="middle">
                    {text.trim()}
                </tspan>
            ));

    const displayFill = evolved ? textTheme?.evolvedTextColor : textTheme?.textColor || 'black';

    // Determine the content to render (note takes precedence over text)
    const contentToRender = note || text || '';

    // Check if content has line breaks (multi-line)
    const hasLineBreaks = contentToRender.includes('\n');

    // Check if content is long (for word wrapping) - only for single-line content
    const isLong = !hasLineBreaks && contentToRender.length > 14;

    let renderedContent;
    let transform = '';

    if (hasLineBreaks) {
        // Multi-line content with actual line breaks (for both notes and component names)
        renderedContent = renderMultiLineText(id, contentToRender);
        transform = ''; // No transform for multi-line text
    } else if (isLong) {
        // Long single-line content (word wrapping)
        renderedContent = trimText(id, contentToRender);
        transform = 'translate(30, 10)';
    } else {
        // Short single-line content
        renderedContent = contentToRender;
        transform = '';
    }
    const handleDblClick = (e: React.MouseEvent<SVGTextElement, MouseEvent>): void => {
        e.stopPropagation();
        console.log('DBLClick');
        // Call external double-click handler if provided (for Notes)
        if (onDoubleClick) {
            console.log('DBLClick', onDoubleClick);
            onDoubleClick(e);
        }

        // Call existing setShowTextField for Components
        if (setShowTextField) {
            setShowTextField(true);
        }
    };
    return (
        <>
            <text
                id={id}
                data-testid={id}
                fontWeight={textTheme?.fontWeight || 'normal'}
                fontSize={textTheme?.fontSize || '14px'}
                className={className}
                textAnchor={textAnchor}
                x={x}
                y={y}
                transform={transform}
                fill={textTheme?.textColor || displayFill}
                onClick={onClick ? onClick : () => {}}
                onDoubleClick={handleDblClick}>
                {renderedContent}
            </text>
        </>
    );
};
export default memo(ComponentTextSymbol);
