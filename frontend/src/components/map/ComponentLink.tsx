import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import { UnifiedComponent } from '../../types/unified/components';
import { FlowLink } from '../../types/unified/links';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import LinkSymbol from '../symbols/LinkSymbol';
import FlowText from './FlowText';
import ModernPositionCalculator from './ModernPositionCalculator';

interface ModernComponentLinkProps {
    mapStyleDefs: MapTheme;
    mapDimensions: MapDimensions;
    startElement: UnifiedComponent;
    endElement: UnifiedComponent;
    link: FlowLink;
    scaleFactor: number;
}

/**
 * ComponentLink - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 */
const ComponentLink: React.FC<ModernComponentLinkProps> = ({
    mapStyleDefs,
    mapDimensions,
    startElement,
    endElement,
    link,
    scaleFactor,
}) => {
    const { enableLinkContext } = useFeatureSwitches();
    const { height, width } = mapDimensions;
    const positionCalc = new ModernPositionCalculator();
    const isFlow = link.flow !== false;
    const isEvolved = startElement.evolved || endElement.evolved;

    const startMaturity =
        startElement.maturity ?? startElement.evolveMaturity ?? 0;

    const endMaturity = endElement.maturity ?? endElement.evolveMaturity ?? 0;

    const x1 = positionCalc.maturityToX(startMaturity, width);
    const x2 = positionCalc.maturityToX(endMaturity, width);

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

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const buffer = 5;

    const angle = getAngle(x1, y1, x2, y2);
    const isUpsideDown = angle > 90 || angle < -90;
    const adjustedAngle = isUpsideDown ? angle + 180 : angle;

    return (
        <>
            <LinkSymbol
                id={`modern_link_${startElement.id}_${endElement.id}`}
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
                flow={isFlow}
                evolved={isEvolved}
                styles={mapStyleDefs.link}
            />
            {link.flowValue && (
                <FlowText
                    mapStyleDefs={mapStyleDefs}
                    startElement={startElement}
                    endElement={endElement}
                    link={link}
                    x={x2}
                    y={y2}
                    scaleFactor={scaleFactor}
                />
            )}
            {enableLinkContext && link.context && (
                <text
                    className="link-context"
                    fontSize={mapStyleDefs.link?.contextFontSize ?? '10px'}
                    textAnchor="middle"
                    x={centerX}
                    y={centerY - buffer}
                    transform={`rotate(${adjustedAngle} ${centerX} ${centerY})`}
                >
                    {link.context}
                </text>
            )}
        </>
    );
};

const getAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

export default ComponentLink;
