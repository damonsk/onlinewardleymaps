import React from 'react';
import { MapTheme, TextTheme } from '../../constants/mapstyles';
import { UnifiedComponent } from '../../types/unified/components';
import { FlowLink } from '../../types/unified/links';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import RelativeMovable from './RelativeMovable';

interface ModernFlowTextProps {
    mapStyleDefs: MapTheme;
    startElement: UnifiedComponent;
    endElement: UnifiedComponent;
    link: FlowLink;
    x: number;
    y: number;
    scaleFactor: number;
}

/**
 * FlowText - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 */
const FlowText: React.FC<ModernFlowTextProps> = ({
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
                x={0}
                y={0}
                scaleFactor={scaleFactor}
                relativeToElementId={`link_${startElement.id}_${endElement.id}`}
            >
                <ComponentTextSymbol
                    id={`flow_text_symbol_${startElement.id}_${endElement.id}`}
                    evolved={endElement.evolved || startElement.evolved}
                    text={link.flowValue || ''}
                    textTheme={theme}
                />
            </RelativeMovable>
        </g>
    );
};

export default FlowText;
