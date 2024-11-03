import React, { useCallback, useEffect } from 'react';
import LinkSymbol from '../symbols/LinkSymbol';
import PositionCalculator from './PositionCalculator';

function FluidLink(props) {
    const { mapStyleDefs, mapDimensions, startElement, origClick } = props;
    const { height, width } = mapDimensions;
    const positionCalc = new PositionCalculator();
    const x1 = positionCalc.maturityToX(startElement.maturity, width);
    const y1 =
        positionCalc.visibilityToY(startElement.visibility, height) +
        (startElement.offsetY ? startElement.offsetY : 0);

    const [position, setPosition] = React.useState({
        x: x1,
        y: y1,
        coords: {},
    });

	const handleMouseMove = useCallback(
		(e) => {
			setPosition((position) => {
				const scaleFactor = props.scaleFactor || 1; // Use scaleFactor from props, default to 1 if not provided
				const xDiff = (position.coords.x - e.pageX) / scaleFactor;
				const yDiff = (position.coords.y - e.pageY) / scaleFactor;
				return {
					x: position.x - xDiff,
					y: position.y - yDiff,
					coords: {
						x: e.pageX,
						y: e.pageY,
					},
				};
			});
		},
		[props.scaleFactor]
	);

    useEffect(() => {
        const pageX = origClick.pageX;
        const pageY = origClick.pageY;

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
    }, [origClick]);

    return (
        <LinkSymbol
            id={`link_${startElement.id}_fluid`}
            x1={x1}
            x2={position.x}
            y1={y1}
            y2={position.y}
            flow={false}
            evolved={false}
            styles={mapStyleDefs.fluidLink}
            filter="url(#ctrlHighlight)"
            strokeDasharray={mapStyleDefs.fluidLink.strokeDasharray}
        />
    );
}

export default FluidLink;
