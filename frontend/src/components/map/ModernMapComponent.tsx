import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import ComponentText from './ComponentText';
import Inertia from './Inertia';
import ModernMovable from './ModernMovable';
import ModernPositionCalculator from './ModernPositionCalculator';

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
}

/**
 * ModernMapComponent uses UnifiedComponent directly for rendering
 * This implements Phase 4A of the migration plan
 */
const ModernMapComponent: React.FC<ModernMapComponentProps> = ({
    launchUrl,
    mapDimensions,
    component, // Using component instead of element
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    scaleFactor,
}) => {
    const calculatedPosition = new ModernPositionCalculator();
    const posX = calculatedPosition.maturityToX(
        component.maturity,
        mapDimensions.width,
    );
    const posY = calculatedPosition.visibilityToY(
        component.visibility,
        mapDimensions.height,
    );

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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

    const updatePosition = (movedPosition: MovedPosition) => {
        if (component.line === undefined) return;

        // Calculate new maturity and visibility from moved position
        const calculator = new ModernPositionCalculator();
        const newMaturity = parseFloat(
            calculator.xToMaturity(movedPosition.x, mapDimensions.width),
        );
        const newVisibility = parseFloat(
            calculator.yToVisibility(movedPosition.y, mapDimensions.height),
        );

        // Find and replace the component position in the map text
        const lines = mapText.split('\n');
        const updatedLines = lines.map((line) => {
            // Check if this is our component line
            const isComponent =
                line.includes(`component ${component.name}`) ||
                line.includes(`component ${component.name} [`);

            if (isComponent) {
                // Replace coordinates with new values
                return line.replace(
                    /\[(.?|.+?)\]/g,
                    `[${newMaturity.toFixed(2)}, ${newVisibility.toFixed(2)}]`,
                );
            }
            return line;
        });

        const newText = updatedLines.join('\n');
        mutateMapText(newText);

        mutateMapText(newText);
    };

    return (
        <ModernMovable
            id={component.id}
            x={posX}
            y={posY}
            onMove={updatePosition}
        >
            <g
                id={component.id}
                onClick={handleClick}
                style={{ cursor: 'pointer' }}
            >
                {component.inertia && (
                    <Inertia
                        maturity={component.maturity}
                        visibility={component.visibility}
                        mapDimensions={mapDimensions}
                    />
                )}
                {/* Use ModernComponentText if available, otherwise adapt to ComponentText interface */}
                <ComponentText
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
                />
            </g>
        </ModernMovable>
    );
};

export default ModernMapComponent;
