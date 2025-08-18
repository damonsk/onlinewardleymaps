import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {useComponentSelection} from '../ComponentSelectionContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';
import ModernDefaultPositionUpdater from './positionUpdaters/ModernDefaultPositionUpdater';
import {ModernExistingCoordsMatcher} from './positionUpdaters/ModernExistingCoordsMatcher';
import {ModernNotDefinedCoordsMatcher} from './positionUpdaters/ModernNotDefinedCoordsMatcher';

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
    const identity = 'anchor';

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

    return (
        <>
            <Movable id={elementKey()} scaleFactor={scaleFactor} onMove={endDrag} x={x()} y={y()} fixedY={false} fixedX={false}>
                <g
                    data-testid={`map-anchor-${anchor.id}`}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        filter: isElementSelected ? 'brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))' : 'none',
                    }}>
                    {/* Selection indicator background */}
                    {isElementSelected && (
                        <rect
                            x={-20}
                            y={-15}
                            width={40}
                            height={20}
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

                    <ComponentTextSymbol
                        id={elementKey('text')}
                        text={anchor.name}
                        x="0"
                        y="-10"
                        textAnchor="middle"
                        evolved={anchor.evolved}
                        textTheme={mapStyleDefs.component}
                        onClick={handleClick}
                    />

                    {/* Hover indicator for deletable anchors */}
                    <g
                        className="anchor-hover-indicator"
                        style={{
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            pointerEvents: 'none',
                        }}>
                        <circle cx={15} cy={-15} r={6} fill="rgba(244, 67, 54, 0.9)" stroke="white" strokeWidth="1" />
                        <text x={15} y={-15} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                            ×
                        </text>
                    </g>
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
                    
                    g[data-testid^="map-anchor-"]:hover .anchor-hover-indicator {
                      opacity: 0.8 !important;
                      animation: fadeIn 0.2s ease-in-out;
                    }
                    `}
                </style>
            </defs>
        </>
    );
};

export default React.memo(Anchor);
