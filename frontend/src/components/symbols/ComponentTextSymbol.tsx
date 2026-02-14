import React, {memo, forwardRef} from 'react';
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
    textAnchor?: React.SVGAttributes<SVGTextElement>['textAnchor'];
    setShowTextField?: (value: React.SetStateAction<boolean>) => void;
}

const ComponentTextSymbol = forwardRef<SVGTextElement, ComponentTextSymbolProps>(
    ({id, x, y, text, evolved, className = 'label', note, textAnchor, textTheme, onClick, onDoubleClick, setShowTextField = null}, ref) => {
        const renderMultiLineText = (id: string, textContent: string) => {
            // Split by actual line breaks (\n) only - no word wrapping for multi-line content
            const lines = textContent.split('\n');
            const tspans: React.ReactElement[] = [];

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

        const displayFill = evolved ? textTheme?.evolvedTextColor : textTheme?.textColor || 'black';

        // Determine the content to render (note takes precedence over text)
        const contentToRender = note || text || '';

        // Check if content has line breaks (multi-line)
        const hasLineBreaks = contentToRender.includes('\n');

        // For notes: single-line notes (unquoted, no \n) should render as single text element
        // Multi-line notes (quoted, with \n) should span multiple lines
        // For components: render single-line content without word wrapping (similar to Notes)
        // Only multi-line content with explicit \n should span multiple lines

        let renderedContent;
        let transform = '';

        if (hasLineBreaks) {
            // Multi-line content with actual line breaks (for both notes and component names)
            renderedContent = renderMultiLineText(id, contentToRender);
            transform = ''; // No transform for multi-line text
        } else {
            // Single-line content (both notes and components) - no automatic word wrapping
            renderedContent = contentToRender;
            transform = '';
        }
        const handleDblClick = (e: React.MouseEvent<SVGTextElement, MouseEvent>): void => {
            e.stopPropagation();
            // Call external double-click handler if provided (for Notes)
            if (onDoubleClick) {
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
                    ref={ref}
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
    },
);

ComponentTextSymbol.displayName = 'ComponentTextSymbol';

export default memo(ComponentTextSymbol);
