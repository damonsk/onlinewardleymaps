import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import { UnifiedComponent } from '../../types/unified/components';
import ModernLinkSymbol from '../symbols/ModernLinkSymbol';
import ModernInertia from './ModernInertia';
import PositionCalculator from './PositionCalculator';

interface EvolutionOffsets {
    commodity: number;
    product: number;
    custom: number;
}

interface ModernEvolvingComponentLinkProps {
    startElement: UnifiedComponent;
    endElement: UnifiedComponent;
    mapDimensions: MapDimensions;
    evolutionOffsets: EvolutionOffsets;
    mapStyleDefs: MapTheme;
}

/**
 * Calculate the boundary point for inertia visualization
 */
const setBoundary = (
    positionCalc: PositionCalculator,
    {
        mapDimensions,
        evolutionOffsets,
        startElement,
        endElement,
    }: {
        mapDimensions: MapDimensions;
        evolutionOffsets: EvolutionOffsets;
        startElement: UnifiedComponent;
        endElement: UnifiedComponent;
    },
): number | null => {
    const boundWidth = mapDimensions.width / 20;
    const limits = [
        evolutionOffsets.custom,
        evolutionOffsets.product,
        evolutionOffsets.commodity,
    ];
    for (let i = 0; i < limits.length; i++) {
        const edge = parseFloat(
            positionCalc.xToMaturity(
                boundWidth * limits[i],
                mapDimensions.width,
            ),
        );
        if (
            (startElement.maturity ?? 0) <= edge &&
            (endElement.maturity ?? 0) >= edge
        ) {
            return edge;
        }
    }
    return (startElement.maturity ?? 0) + 0.05;
};

/**
 * ModernEvolvingComponentLink - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders an evolving component link with inertia indicators
 */
const ModernEvolvingComponentLink: React.FC<
    ModernEvolvingComponentLinkProps
> = ({
    startElement,
    endElement,
    mapDimensions,
    evolutionOffsets,
    mapStyleDefs,
}) => {
    if (!startElement || !endElement) {
        return null;
    }

    const { height, width } = mapDimensions;
    const positionCalc = new PositionCalculator();

    // Handle the coordinate calculation based on unified component types
    const x1 = positionCalc.maturityToX(startElement.maturity ?? 0, width);
    const x2 = positionCalc.maturityToX(endElement.maturity ?? 0, width);

    const y1 =
        positionCalc.visibilityToY(
            typeof startElement.visibility === 'string'
                ? parseFloat(startElement.visibility)
                : startElement.visibility,
            height,
        ) + (startElement.offsetY ?? 0);

    const y2 =
        positionCalc.visibilityToY(
            typeof endElement.visibility === 'string'
                ? parseFloat(endElement.visibility)
                : endElement.visibility,
            height,
        ) + (endElement.offsetY ?? 0);

    // Calculate boundary point for inertia
    let boundary: number | undefined;

    if (startElement.inertia) {
        boundary =
            setBoundary(positionCalc, {
                mapDimensions,
                evolutionOffsets,
                startElement,
                endElement,
            }) || x1;
    }

    return (
        <>
            <ModernLinkSymbol
                id={`modern_evolving_link_${startElement.id}_${endElement.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray="5 5"
                marker="url(#arrow)"
                isMarkerStart={false}
                styles={mapStyleDefs.link}
                evolved={true}
            />
            {endElement.inertia && boundary !== undefined && (
                <ModernInertia
                    maturity={boundary}
                    visibility={endElement.visibility}
                    mapDimensions={mapDimensions}
                />
            )}
        </>
    );
};

export default ModernEvolvingComponentLink;
