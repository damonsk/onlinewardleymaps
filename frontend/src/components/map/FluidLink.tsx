import React, {MouseEvent, useCallback, useEffect, useState} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../constants/mapstyles';
import {UnifiedComponent} from '../../types/unified/components';
import LinkSymbol from '../symbols/LinkSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';

interface ModernFluidLinkProps {
    mapStyleDefs: MapTheme;
    mapDimensions: MapDimensions;
    startElement: UnifiedComponent;
    origClick: MouseEvent<Element>;
    scaleFactor?: number;
}

interface Position {
    x: number;
    y: number;
    coords: {
        x?: number;
        y?: number;
    };
}

/**
 * FluidLink - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders a fluid link that follows the mouse cursor
 * Used during the component linking process
 */
const FluidLink: React.FC<ModernFluidLinkProps> = ({mapStyleDefs, mapDimensions, startElement, origClick, scaleFactor = 1}) => {
    const {height, width} = mapDimensions;
    const positionCalc = new ModernPositionCalculator();

    const startMaturity = startElement.maturity ?? startElement.evolveMaturity ?? 0;
    const x1 = positionCalc.maturityToX(startMaturity, width);

    const y1 =
        positionCalc.visibilityToY(
            typeof startElement.visibility === 'string' ? parseFloat(startElement.visibility) : startElement.visibility,
            height,
        ) + (startElement.offsetY ?? 0);

    const [position, setPosition] = useState<Position>({
        x: x1,
        y: y1,
        coords: {},
    });

    const handleMouseMove = useCallback(
        (e: Event) => {
            const mouseEvent = e as globalThis.MouseEvent;
            setPosition(position => {
                const xDiff = (position.coords.x! - mouseEvent.pageX) / scaleFactor;
                const yDiff = (position.coords.y! - mouseEvent.pageY) / scaleFactor;
                return {
                    x: position.x - xDiff,
                    y: position.y - yDiff,
                    coords: {
                        x: mouseEvent.pageX,
                        y: mouseEvent.pageY,
                    },
                };
            });
        },
        [scaleFactor],
    );

    useEffect(() => {
        const pageX = origClick.nativeEvent.pageX;
        const pageY = origClick.nativeEvent.pageY;

        setPosition(position =>
            Object.assign({}, position, {
                coords: {
                    x: pageX,
                    y: pageY,
                },
            }),
        );
        document.addEventListener('mousemove', handleMouseMove);
        return function cleanup() {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [origClick, handleMouseMove]);

    return (
        <LinkSymbol
            id={`modern_link_${startElement.id}_fluid`}
            x1={x1}
            x2={position.x}
            y1={y1}
            y2={position.y}
            flow={false}
            evolved={false}
            styles={mapStyleDefs.fluidLink!}
            filter="url(#ctrlHighlight)"
            strokeDasharray={mapStyleDefs.fluidLink?.strokeDasharray}
        />
    );
};

export default FluidLink;
