import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import ComponentText from './ComponentText';
import Inertia from './Inertia';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';

interface MovedPosition {
    x: number;
    y: number;
}

/**
 * Modern Map Component - Phase 4A: Core Component Type Migration
 * This component uses UnifiedComponent directly without adapters
 */
interface ModernMapComponentProps {
    launchUrl?: (url: string) => void;
    mapDimensions: MapDimensions;
    component: UnifiedComponent; // Changed from element: MapElement to component: UnifiedComponent
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
    children?: React.ReactNode;
}

/**
 * MapComponent uses UnifiedComponent directly for rendering
 * This implements Phase 4A of the migration plan
 */
const MapComponent: React.FC<ModernMapComponentProps> = ({
    launchUrl,
    mapDimensions,
    component, // Using component instead of element
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    scaleFactor,
    children,
}) => {
    const isModKeyPressed = useModKeyPressedConsumer();
    const calculatedPosition = new ModernPositionCalculator();
    const posX = calculatedPosition.maturityToX(component.maturity, mapDimensions.width);
    const posY = calculatedPosition.visibilityToY(component.visibility, mapDimensions.height) + (component.offsetY ? component.offsetY : 0);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (component.line) {
            // Always set the highlight line to move the cursor to this line
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

    const updatePosition = (movedPosition: MovedPosition) => {
        if (component.line === undefined) return;

        // Calculate new maturity and visibility from moved position
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
                <g id={component.id} onClick={handleClick} style={{cursor: 'pointer'}}>
                    {children}
                </g>
            </Movable>

            {component.inertia && !component.evolved && component.evolving === false && (
                <Inertia
                    maturity={component.maturity + 0.02}
                    visibility={component.visibility}
                    mapDimensions={mapDimensions}
                />
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
                        if (component.line) {
                            setHighlightLine(component.line);
                        }
                    }}
                />
            </g>
        </>
    );
};

export default MapComponent;
