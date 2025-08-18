import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useModKeyPressedConsumer} from '../KeyPressContext';
import ComponentText from './ComponentText';
import {useContextMenu} from './ContextMenuProvider';
import Inertia from './Inertia';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';

interface MovedPosition {
    x: number;
    y: number;
}

interface ModernMapComponentProps {
    launchUrl?: (url: string) => void;
    mapDimensions: MapDimensions;
    component: UnifiedComponent;
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
    children?: React.ReactNode;
}

const MapComponent: React.FC<ModernMapComponentProps> = ({
    launchUrl,
    mapDimensions,
    component,
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    scaleFactor,
    children,
}) => {
    const isModKeyPressed = useModKeyPressedConsumer();
    const {isSelected, selectComponent} = useComponentSelection();
    const {showContextMenu} = useContextMenu();
    const calculatedPosition = new ModernPositionCalculator();
    const posX = calculatedPosition.maturityToX(component.maturity, mapDimensions.width);
    const posY = calculatedPosition.visibilityToY(component.visibility, mapDimensions.height) + (component.offsetY ? component.offsetY : 0);

    // Check if this component is currently selected
    const isElementSelected = isSelected(component.id);

    const handleClick = (e: React.MouseEvent) => {
        console.log('MapComponent clicked, selecting component:', component.id);
        e.preventDefault();
        e.stopPropagation();

        // Select this component
        selectComponent(component.id);

        console.log('Component selected:', component);

        if (component.line) {
            setHighlightLine(component.line);
        }

        if (component.url && launchUrl) {
            if (typeof component.url === 'string') {
                launchUrl(component.url);
            } else if (component.url.url) {
                launchUrl(component.url.url);
            }
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        console.log('MapComponent context menu triggered for:', component.id);
        e.preventDefault();
        e.stopPropagation();

        // Select the component first if not already selected
        if (!isElementSelected) {
            console.log('Selecting component:', component.id);
            selectComponent(component.id);
        } else {
            console.log('Component already selected:', component.id);
        }

        // Show context menu at cursor position
        console.log('Showing context menu at:', {x: e.clientX, y: e.clientY});
        showContextMenu({x: e.clientX, y: e.clientY}, component.id);
    };

    const updatePosition = (movedPosition: MovedPosition) => {
        if (component.line === undefined) return;

        const calculator = new ModernPositionCalculator();
        const newMaturity = parseFloat(calculator.xToMaturity(movedPosition.x, mapDimensions.width));
        const newVisibility = parseFloat(calculator.yToVisibility(movedPosition.y, mapDimensions.height));

        const lines = mapText.split('\n');

        if (component.evolved) {
            const updatedLines = lines.map(line => {
                const normalizedLine = line.replace(/\s/g, '');
                const componentNameNormalized = component.name.replace(/\s/g, '');
                if (normalizedLine.indexOf(`evolve${componentNameNormalized}`) === 0) {
                    return line.replace(/\s([0-9]?\.[0-9]+[0-9]?)+/g, ` ${newMaturity.toFixed(2)}`);
                }
                return line;
            });

            const newText = updatedLines.join('\n');
            mutateMapText(newText);
            return;
        }

        const updatedLines = lines.map((line, index) => {
            if (index + 1 === component.line) {
                const regex = new RegExp(`component\\s+${component.name}\\b`, 'i');
                if (regex.test(line)) {
                    if (line.includes('label')) {
                        const parts = line.split(/\blabel\b/);
                        const updatedFirstPart = parts[0].replace(
                            /\[([^[\]]+)\]/,
                            `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`,
                        );
                        return updatedFirstPart + 'label' + parts[1];
                    } else {
                        return line.replace(/\[([^[\]]+)\]/, `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`);
                    }
                }
            }
            return line;
        });

        const newText = updatedLines.join('\n');
        mutateMapText(newText);
    };

    return (
        <>
            <Movable
                id={`element_${component.id}`}
                x={posX}
                y={posY}
                onMove={updatePosition}
                fixedY={component.evolved}
                fixedX={false}
                shouldShowMoving={true}
                isModKeyPressed={component.evolved ? false : isModKeyPressed}
                scaleFactor={scaleFactor}>
                <g
                    id={component.id}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        filter: isElementSelected ? 'brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))' : 'none',
                    }}
                    data-testid={`map-component-${component.id}`}>
                    {/* Selection indicator background */}
                    {isElementSelected && (
                        <circle
                            cx={0}
                            cy={0}
                            r={12}
                            fill="rgba(33, 150, 243, 0.1)"
                            stroke="#2196F3"
                            strokeWidth={2}
                            strokeOpacity={0.6}
                            strokeDasharray="3,2"
                            style={{
                                animation: 'componentSelectionPulse 2s ease-in-out infinite',
                            }}
                        />
                    )}

                    {children}

                    {/* Hover indicator for deletable components */}
                    <g
                        className="component-hover-indicator"
                        style={{
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            pointerEvents: 'none',
                        }}>
                        <circle cx={8} cy={-8} r={6} fill="rgba(244, 67, 54, 0.9)" stroke="white" strokeWidth="1" />
                        <text x={8} y={-8} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                            ×
                        </text>
                    </g>
                </g>
            </Movable>

            {component.inertia && !component.evolved && component.evolving === false && (
                <Inertia maturity={component.maturity + 0.02} visibility={component.visibility} mapDimensions={mapDimensions} />
            )}

            <g transform={`translate(${posX},${posY})`}>
                <ComponentText
                    component={component}
                    cx={0}
                    cy={0}
                    styles={mapStyleDefs?.component}
                    id={`component_text_${component.id}`}
                    element={{
                        id: component.id,
                        name: component.name,
                        type: component.type,
                        line: component.line,
                        evolved: component.evolved,
                        evolving: component.evolving,
                        override: component.override,
                        maturity: component.maturity,
                        label: component.label,
                    }}
                    mapStyleDefs={mapStyleDefs}
                    scaleFactor={scaleFactor}
                    mapText={mapText}
                    mutateMapText={mutateMapText}
                    onClick={() => {
                        selectComponent(component.id);
                        if (component.line) {
                            setHighlightLine(component.line);
                        }
                    }}
                />
            </g>

            {/* CSS animations for component selection */}
            <defs>
                <style>
                    {`
                    @keyframes componentSelectionPulse {
                      0%, 100% {
                        stroke-opacity: 0.4;
                        r: 12;
                      }
                      50% {
                        stroke-opacity: 0.8;
                        r: 14;
                      }
                    }
                    
                    g[data-testid^="map-component-"]:hover .component-hover-indicator {
                      opacity: 0.8 !important;
                      animation: fadeIn 0.2s ease-in-out;
                    }
                    `}
                </style>
            </defs>
        </>
    );
};

export default MapComponent;
