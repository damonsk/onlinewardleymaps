import React from 'react';
import { MapTheme } from '../../constants/mapstyles';
import { Component } from '../../MapElements';
import MetaPositioner from '../../MetaPositioner';
import RelativeMovable from '../map/RelativeMovable';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';

interface FlowTextProps {
    x: number;
    y: number;
    startElement: Component;
    endElement: Component;
    metaText: string;
    link: {
        flowValue?: string;
        flow?: boolean;
        future?: boolean;
        past?: boolean;
        context?: string;
    };
    setMetaText: (text: string) => void;
    mapStyleDefs: MapTheme;
    scaleFactor?: number;
}

const FlowText: React.FC<FlowTextProps> = ({
    x,
    y,
    startElement,
    endElement,
    metaText,
    link,
    setMetaText,
    mapStyleDefs,
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
                    textTheme={mapStyleDefs.link}
                />
            </RelativeMovable>
        </g>
    );
};

export default React.memo(FlowText);
