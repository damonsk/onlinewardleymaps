import React from 'react';
import { MapTheme, TextTheme } from '../../constants/mapstyles';
import {
    Link,
    MapElement,
} from '../../linkStrategies/LinkStrategiesInterfaces';
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
    x: number;
    y: number;
    scaleFactor: number;
}

const FlowText: React.FC<FlowTextProps> = ({
    mapStyleDefs,
    startElement,
    endElement,
    link,
    x,
    y,
    scaleFactor,
}) => {
    const flowLabelElementId = `flow_text_${startElement.id}_${endElement.id}`;

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
                y={
                    (() => {
                        return { x: 0, y: -30 };
                    })().y
                }
                x={
                    (() => {
                        return { x: 0, y: -30 };
                    })().x
                }
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
