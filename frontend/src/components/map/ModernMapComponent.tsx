import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import { useModKeyPressedConsumer } from '../KeyPressContext';
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
    children?: React.ReactNode;
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
    children,
}) => {
    const isModKeyPressed = useModKeyPressedConsumer();
    const calculatedPosition = new ModernPositionCalculator();
    const posX = calculatedPosition.maturityToX(
        component.maturity,
        mapDimensions.width,
    );
    const posY =
        calculatedPosition.visibilityToY(
            component.visibility,
            mapDimensions.height,
        ) + (component.offsetY ? component.offsetY : 0);

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
        const newMaturity = parseFloat(
            calculator.xToMaturity(movedPosition.x, mapDimensions.width),
        );
        const newVisibility = parseFloat(
            calculator.yToVisibility(movedPosition.y, mapDimensions.height),
        );

        // Find and replace the component position in the map text
        const lines = mapText.split('\n');
        const updatedLines = lines.map((line, index) => {
            // Only update the specific line that matches this component's line number
            if (index + 1 === component.line) {
                // Check for component with exact name match using regex to avoid partial matches
                const regex = new RegExp(
                    `component\\s+${component.name}\\b`,
                    'i',
                );
                if (regex.test(line)) {
                    // Handle lines with or without label differently
                    if (line.includes('label')) {
                        // Split the line at "label" to separate component coordinates from label coordinates
                        const parts = line.split(/\blabel\b/);
                        // Only replace the first set of coordinates (component position)
                        const updatedFirstPart = parts[0].replace(
                            /\[(.?|.+?)\]/,
                            `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`,
                        );
                        // Rejoin with the label part unchanged
                        return updatedFirstPart + 'label' + parts[1];
                    } else {
                        // No label in the line, safe to replace the only coordinate pair
                        return line.replace(
                            /\[(.?|.+?)\]/,
                            `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`,
                        );
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
            <ModernMovable
                id={`element_${component.id}`}
                x={posX}
                y={posY}
                onMove={updatePosition}
                fixedY={component.evolved}
                fixedX={false}
                shouldShowMoving={true}
                isModKeyPressed={isModKeyPressed}
                scaleFactor={scaleFactor}
            >
                <g
                    id={component.id}
                    onClick={handleClick}
                    style={{ cursor: 'pointer' }}
                >
                    {children}
                </g>
            </ModernMovable>

            {component.inertia &&
                !component.evolved &&
                component.evolving === false && (
                    <Inertia
                        maturity={component.maturity + 0.05} // Added 0.05 offset to match legacy implementation
                        visibility={component.visibility}
                        mapDimensions={mapDimensions}
                    />
                )}

            <g transform={`translate(${posX},${posY})`}>
                <ComponentText
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
                            // Simply set the highlight line to move the cursor
                            setHighlightLine(component.line);
                        }
                    }}
                />
            </g>
        </>
    );
};

export default ModernMapComponent;
