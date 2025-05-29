import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import { MapElement } from '../../linkStrategies/LinkStrategiesInterfaces';
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
        endElement,
    }: {
        mapDimensions: MapDimensions;
        evolutionOffsets: EvolutionOffsets;
        startElement: MapElement;
        endElement: MapElement;
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
        if (startElement.maturity <= edge && endElement.maturity >= edge) {
            return edge;
        }
    }
    return startElement.maturity + 0.05;
};

const EvolvingComponentLink: React.FC<EvolvingComponentLinkProps> = ({
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

    // Handle the coordinate calculation based on whether we're using unified canvas or legacy
    const x1 = positionCalc.maturityToX(startElement.maturity ?? 0, width);
    const x2 = positionCalc.maturityToX(endElement.maturity ?? 0, width);

    const y1 =
        positionCalc.visibilityToY(startElement.visibility, height) +
        (startElement.offsetY ? startElement.offsetY : 0);
    const y2 =
        positionCalc.visibilityToY(endElement.visibility, height) +
        (endElement.offsetY ? endElement.offsetY : 0);

    let boundary: number | undefined;

    console.log('EvolvingComponentLink', {
        start: startElement.maturity,
        end: endElement.maturity,
    });

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
            <LinkSymbol
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray="5 5"
                marker="url(#arrow)"
                isMarkerStart={false}
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
