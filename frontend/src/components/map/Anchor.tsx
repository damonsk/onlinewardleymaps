import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import { createSelectionBoxDimensions, estimateTextDimensions, measureTextElement } from '../../utils/textMeasurement';
import { useComponentSelection } from '../ComponentSelectionContext';
import { useComponentLinkHighlight } from '../contexts/ComponentLinkHighlightContext';
import AnchorText from './AnchorText';
import { useContextMenu } from './ContextMenuProvider';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';
import ModernDefaultPositionUpdater from './positionUpdaters/ModernDefaultPositionUpdater';
import { ModernExistingCoordsMatcher } from './positionUpdaters/ModernExistingCoordsMatcher';
import { ModernNotDefinedCoordsMatcher } from './positionUpdaters/ModernNotDefinedCoordsMatcher';

interface ModernAnchorProps {
    anchor: UnifiedComponent;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (...args: any[]) => any;
    mapStyleDefs: MapTheme;
    onClick: (event: MouseEvent) => void;
    scaleFactor: number;
}

const Anchor: React.FunctionComponent<ModernAnchorProps> = ({
    anchor,
    mapText,
    mutateMapText,
    mapDimensions,
    mapStyleDefs,
    onClick,
    scaleFactor,
}) => {
    const {isSelected, selectComponent} = useComponentSelection();
    const {setHoveredComponent} = useComponentLinkHighlight();
    const {showContextMenu} = useContextMenu();
    const identity = 'anchor';
    const textElementRef = useRef<SVGTextElement>(null);
    const [selectionBoxDimensions, setSelectionBoxDimensions] = useState(() => {
        // Initial estimate based on text content
        const fontSize = parseInt(mapStyleDefs?.component?.fontSize || '14');
        const estimated = estimateTextDimensions(anchor.name, fontSize, mapStyleDefs?.fontFamily || 'Arial, sans-serif', false);
        return createSelectionBoxDimensions(estimated, 6); // 6px padding
    });

    // Check if this anchor is currently selected
    const isElementSelected = isSelected(anchor.id);
    const elementKey = (prefix: string = '', suffix: string = '') => {
        return `${identity}_${prefix !== undefined ? prefix + '_' : ''}${anchor.id}${suffix !== undefined ? '_' + suffix : ''}`;
    };

    const positionCalc = new ModernPositionCalculator();
    const positionUpdater = new ModernDefaultPositionUpdater(identity, mapText, mutateMapText, [
        ModernExistingCoordsMatcher,
        ModernNotDefinedCoordsMatcher,
    ]);
    const x = () => positionCalc.maturityToX(anchor.maturity, mapDimensions.width);
    const y = () => positionCalc.visibilityToY(anchor.visibility, mapDimensions.height);

    // Measure actual text element dimensions after render
    useEffect(() => {
        if (textElementRef.current) {
            // Use requestAnimationFrame to ensure the element is fully rendered
            requestAnimationFrame(() => {
                if (textElementRef.current) {
                    const measured = measureTextElement(textElementRef.current);
                    const boxDimensions = createSelectionBoxDimensions(measured, 6);
                    setSelectionBoxDimensions(boxDimensions);
                }
            });
        }
    }, [anchor.name, mapStyleDefs]);

    // Update dimensions when anchor name changes
    useEffect(() => {
        const fontSize = parseInt(mapStyleDefs?.component?.fontSize || '14');
        const estimated = estimateTextDimensions(anchor.name, fontSize, mapStyleDefs?.fontFamily || 'Arial, sans-serif', false);
        setSelectionBoxDimensions(createSelectionBoxDimensions(estimated, 6));
    }, [anchor.name, mapStyleDefs]);

    function endDrag(moved: {y: number; x: number}) {
        const visibility = positionCalc.yToVisibility(moved.y, mapDimensions.height);
        const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
        positionUpdater.update({param1: visibility, param2: maturity}, anchor.name);
    }

    const handleClick = (event: MouseEvent) => {
        selectComponent(anchor.id);
        onClick(event);
        event.stopPropagation();
    };

    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        // Select the anchor when right-clicked
        selectComponent(anchor.id);

        // Show context menu
        showContextMenu({x: event.clientX, y: event.clientY}, anchor.id);
    };

    const handleMouseEnter = () => {
        setHoveredComponent(anchor.name);
    };

    const handleMouseLeave = () => {
        setHoveredComponent(null);
    };

    return (
        <>
            <Movable id={elementKey()} scaleFactor={scaleFactor} onMove={endDrag} x={x()} y={y()} fixedY={false} fixedX={false}>
                <g
                    data-testid={`map-anchor-${anchor.id}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={handleContextMenu}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        filter: isElementSelected ? 'brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))' : 'none',
                    }}>
                    {/* Selection indicator background - rendered first */}
                    {isElementSelected && (
                        <rect
                            x={selectionBoxDimensions.x}
                            y={selectionBoxDimensions.y - 15}
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
                                animation: 'anchorSelectionPulse 2s ease-in-out infinite',
                            }}
                        />
                    )}

                    {/* Hover indicator - rendered second so text appears above */}
                    <rect
                        className="anchor-hover-indicator"
                        x={selectionBoxDimensions.x}
                        y={selectionBoxDimensions.y - 15}
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

                    {/* Anchor text content - rendered last so it appears on top */}
                    <AnchorText
                        anchor={anchor}
                        cx="0"
                        cy="-10"
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        scaleFactor={scaleFactor}
                        onClick={handleClick}
                    />
                </g>
            </Movable>

            {/* CSS animations for anchor selection */}
            <defs>
                <style>
                    {`
                    @keyframes anchorSelectionPulse {
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
                    
                    g[data-testid^="map-anchor-"]:hover .anchor-hover-indicator {
                      opacity: 0.5 !important;
                      animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                    `}
                </style>
            </defs>
        </>
    );
};

export default React.memo(Anchor);
