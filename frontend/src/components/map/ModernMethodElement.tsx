import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import { MethodComponent } from '../../utils/methodExtractor';
import ModernMethodSymbol from '../symbols/ModernMethodSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';

interface ModernMethodElementProps {
    methodComponent: UnifiedComponent | MethodComponent; // Accept both regular and method components
    mapDimensions: MapDimensions;
    method: string;
    mapStyleDefs: MapTheme;
    setHighlightLine?: (line: number) => void;
}

/**
 * ModernMethodElement - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component positions and renders method indicators on the map
 */
const ModernMethodElement: React.FC<ModernMethodElementProps> = ({
    methodComponent,
    mapDimensions,
    method,
    mapStyleDefs,
    setHighlightLine,
}) => {
    const positionCalc = new ModernPositionCalculator();

    console.log('Method component:', methodComponent);

    // Calculate position values, handling undefined cases
    let maturity = methodComponent.maturity;
    let visibilityValue = methodComponent.visibility;

    // Check if this is a MethodComponent type
    const isMethodComponent = 'method' in methodComponent;

    if (maturity === undefined && methodComponent.name) {
        console.log('Method without explicit position:', methodComponent.name);

        // This component doesn't have a position - it needs to use the position
        // of the component it references. This matches the legacy implementation.

        // Only check targetComponentName if this is a MethodComponent
        if (isMethodComponent && 'targetComponentName' in methodComponent) {
            console.log(
                'Method has a target component:',
                (methodComponent as MethodComponent).targetComponentName,
            );
        } else {
            console.log('Method has no target component information');
        }

        // If the component has a targetComponentName and still no maturity,
        // it means processStandaloneMethods failed to find its target.
        // Use fallback positioning to ensure something renders.
        if (maturity === undefined) {
            maturity = 0.5;
            visibilityValue = 0.5;
            console.warn(
                `Using fallback position for "${methodComponent.name}": [${maturity}, ${visibilityValue}]`,
            );
        }
    }

    // Convert maturity to x position with safeguards against NaN
    const x = positionCalc.maturityToX(
        isNaN(maturity as number) ? 0 : (maturity as number),
        mapDimensions.width,
    );

    // Convert visibility to y position, handling string vs number
    let yValue: number;
    if (typeof visibilityValue === 'string') {
        yValue = parseFloat(visibilityValue);
    } else if (visibilityValue !== undefined) {
        yValue = visibilityValue as number;
    } else {
        yValue = 0;
    }

    // Let's not modify the position directly - the method elements
    // should use the exact position from mapProcessing.ts
    // The positions are already properly calculated there

    const y = positionCalc.visibilityToY(
        isNaN(yValue) ? 0 : yValue,
        mapDimensions.height,
    );

    // Add debug logging to identify positioning issues
    if (isNaN(x) || isNaN(y)) {
        console.warn('Invalid coordinates for method element:', {
            name: methodComponent.name,
            method,
            maturity,
            visibility: visibilityValue,
            x,
            y,
        });
    }

    // Log the final position for all method elements
    console.log(`Method ${methodComponent.name} position:`, {
        maturity,
        visibility: visibilityValue,
        x,
        y,
        method,
    });

    // Handle click to highlight the line in the editor
    const handleClick = () => {
        if (setHighlightLine && methodComponent.line) {
            setHighlightLine(methodComponent.line);
        }
    };

    return (
        <ModernMethodSymbol
            id={`method_${methodComponent.id}`}
            x={x}
            y={y}
            method={method}
            styles={mapStyleDefs.methods}
            onClick={handleClick}
        />
    );
};

export default ModernMethodElement;
