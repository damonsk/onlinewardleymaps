import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import { MapElement } from '../../linkStrategies/LinkStrategiesInterfaces';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import LinkSymbol from '../symbols/LinkSymbol';
import Inertia from './Inertia';
import PositionCalculator from './PositionCalculator';

interface EvolutionOffsets {
    commodity: number;
    product: number;
    custom: number;
}

interface EvolvingComponentLinkProps {
    startElement: MapElement | undefined;
    endElement: MapElement | undefined;
    mapDimensions: MapDimensions;
    evolutionOffsets: EvolutionOffsets;
    mapStyleDefs: MapTheme;
}

const setBoundary = (
    positionCalc: PositionCalculator,
    {
        mapDimensions,
        evolutionOffsets,
        startElement,
    }: {
        mapDimensions: MapDimensions;
        evolutionOffsets: EvolutionOffsets;
        startElement: MapElement;
    },
): number | null => {
    const boundWidth = mapDimensions.width / 20;
    const limits = [
        evolutionOffsets.commodity,
        evolutionOffsets.product,
        evolutionOffsets.custom,
    ];
    for (let i = 0; i < limits.length; i++) {
        const edge = parseFloat(
            positionCalc.xToMaturity(
                boundWidth * limits[i],
                mapDimensions.width,
            ),
        );
        if (startElement.maturity >= edge) {
            return edge;
        }
    }
    return null;
};

const EvolvingComponentLink: React.FC<EvolvingComponentLinkProps> = ({
    startElement,
    endElement,
    mapDimensions,
    evolutionOffsets,
    mapStyleDefs,
}) => {
    const { enableUnifiedMapCanvas } = useFeatureSwitches();

    if (!startElement || !endElement) {
        return null;
    }
    const { height, width } = mapDimensions;
    const positionCalc = new PositionCalculator();

    // Handle the coordinate calculation based on whether we're using unified canvas or legacy
    let x1, x2;
    if (enableUnifiedMapCanvas) {
        // In unified canvas: startElement is evolved component, endElement is evolving component
        // startElement (evolved) should use its maturity, endElement (evolving) should use its maturity
        x1 = positionCalc.maturityToX(startElement.maturity ?? 0, width);
        x2 = positionCalc.maturityToX(endElement.maturity ?? 0, width);
    } else {
        // Legacy behavior: startElement is evolving component with evolveMaturity, endElement is evolving component
        x1 = positionCalc.maturityToX(startElement.evolveMaturity ?? 0, width);
        x2 = positionCalc.maturityToX(endElement.maturity ?? 0, width);
    }

    const y1 =
        positionCalc.visibilityToY(startElement.visibility, height) +
        (startElement.offsetY ? startElement.offsetY : 0);
    const y2 =
        positionCalc.visibilityToY(endElement.visibility, height) +
        (endElement.offsetY ? endElement.offsetY : 0);
    let boundary: number | undefined;

    if (endElement.inertia) {
        boundary =
            setBoundary(positionCalc, {
                mapDimensions,
                evolutionOffsets,
                startElement,
            }) || x1;
    }

    return (
        <>
            <LinkSymbol
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray="5 5"
                markerStart="url(#arrow)"
                styles={mapStyleDefs.link}
                evolved
            />
            {endElement.inertia && (
                <Inertia
                    maturity={boundary!}
                    visibility={endElement.visibility}
                    mapDimensions={mapDimensions}
                />
            )}
        </>
    );
};

export default EvolvingComponentLink;
