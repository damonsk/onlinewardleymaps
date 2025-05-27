import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import LinkSymbol from '../symbols/LinkSymbol';
import Inertia from './Inertia';
import PositionCalculator from './PositionCalculator';

interface EvolutionOffsets {
    commodity: number;
    product: number;
    custom: number;
}

interface MapElement {
    id: string;
    maturity: number;
    visibility: number;
    offsetY?: number;
    evolved?: boolean;
    evolving?: boolean;
    inertia?: boolean;
}

interface EvolvingComponentLinkProps {
    startElement: MapElement;
    endElement: MapElement;
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
        const edge = positionCalc.xToMaturity(
            boundWidth * limits[i],
            mapDimensions.width,
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
    const { height, width } = mapDimensions;
    const positionCalc = new PositionCalculator();
    const x1 = positionCalc.maturityToX(startElement.maturity, width);
    const x2 = positionCalc.maturityToX(endElement.maturity, width);
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
