import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapElement } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import LinkSymbol from '../symbols/LinkSymbol';
import PositionCalculator from './PositionCalculator';

interface FluidLinkProps {
    mapStyleDefs: MapTheme;
    mapDimensions: MapDimensions;
    startElement: MapElement;
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

function FluidLink(props: FluidLinkProps): JSX.Element {
    const { mapStyleDefs, mapDimensions, startElement, origClick } = props;
    const { height, width } = mapDimensions;
    const positionCalc = new PositionCalculator();
    const x1 = positionCalc.maturityToX(startElement.maturity, width);
    const y1 =
        positionCalc.visibilityToY(startElement.visibility, height) +
        (startElement.offsetY ? startElement.offsetY : 0);

    const [position, setPosition] = useState<Position>({
        x: x1,
        y: y1,
        coords: {},
    });

    const handleMouseMove = useCallback(
        (e: Event) => {
            const mouseEvent = e as globalThis.MouseEvent;
            setPosition((position) => {
                const scaleFactor = props.scaleFactor || 1;
                const xDiff =
                    (position.coords.x! - mouseEvent.pageX) / scaleFactor;
                const yDiff =
                    (position.coords.y! - mouseEvent.pageY) / scaleFactor;
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
        [props.scaleFactor],
    );

    useEffect(() => {
        const pageX = origClick.nativeEvent.pageX;
        const pageY = origClick.nativeEvent.pageY;

        setPosition((position) =>
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
            id={`link_${startElement.id}_fluid`}
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
}

export default FluidLink;
