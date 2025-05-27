import React from 'react';
import { MapTheme, TextTheme } from '../../constants/mapstyles';
import {
    Link,
    MapElement,
} from '../../linkStrategies/LinkStrategiesInterfaces';
import MetaPositioner from '../../MetaPositioner';
import RelativeMovable from '../map/RelativeMovable';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';

interface FlowTextProps {
    mapStyleDefs: MapTheme;
    startElement: MapElement;
    endElement: MapElement;
    link: Link & {
        flow?: boolean;
        future?: boolean;
        past?: boolean;
        context?: string;
        flowValue?: string;
    };
    setMetaText: (text: string) => void;
    metaText: string;
    x: number;
    y: number;
    scaleFactor: number;
}

const FlowText: React.FC<FlowTextProps> = ({
    mapStyleDefs,
    startElement,
    endElement,
    link,
    setMetaText,
    metaText,
    x,
    y,
    scaleFactor,
}) => {
    const metaPosition = new MetaPositioner();
    const flowLabelElementId = `flow_text_${startElement.id}_${endElement.id}`;

    const getMetaPosition = () => {
        const defaultOffset = {
            x: 0,
            y: -30,
            coords: { x: 0, y: -30 },
        };
        return metaPosition.for(flowLabelElementId, metaText, defaultOffset);
    };

    const flowLabelPosition = getMetaPosition();

    const flowLabelEndDrag = (moved: {
        x: number;
        y: number;
        coords: { x: number; y: number };
    }) => {
        setMetaText(metaPosition.update(flowLabelElementId, metaText, moved));
    };

    if (!link.flowValue) {
        return null;
    }

    const theme: TextTheme = {
        fontWeight: mapStyleDefs.component.fontWeight,
        evolvedTextColor: mapStyleDefs.component.evolvedTextColor,
        textColor: mapStyleDefs.component.textColor,
    };

    return (
        <g id={'flow_' + endElement.name} transform={`translate(${x},${y})`}>
            <RelativeMovable
                id={flowLabelElementId}
                fixedX={false}
                fixedY={false}
                onMove={flowLabelEndDrag}
                y={flowLabelPosition.y}
                x={flowLabelPosition.x}
                scaleFactor={scaleFactor}
            >
                <ComponentTextSymbol
                    className="draggable label"
                    id={flowLabelElementId}
                    x="5"
                    y="5"
                    textAnchor="start"
                    fill={mapStyleDefs.link?.flowText}
                    text={link.flowValue}
                    textTheme={theme}
                />
            </RelativeMovable>
        </g>
    );
};

export default React.memo(FlowText);
