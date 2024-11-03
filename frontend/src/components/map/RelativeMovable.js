import React, { useEffect, useCallback } from 'react';

function RelativeMovable(props) {
    const [moving, setMoving] = React.useState(false);
    const x = useCallback(() => props.x, [props.x]);
    const y = useCallback(() => props.y, [props.y]);
    const [position, setPosition] = React.useState({
        x: x(),
        y: y(),
        coords: {},
    });

    const handleMouseMove = React.useRef(e => {
        setPosition(position => {
            const xDiff = position.coords.x - e.pageX;
            const yDiff = position.coords.y - e.pageY;
            return {
                x: position.x - xDiff,
                y: position.y - yDiff,
                coords: {
                    x: e.pageX,
                    y: e.pageY,
                },
            };
        });
    });

    const handleEscape = k => {
        if (k.key === 'Escape' && moving) {
            setMoving(false);
            endDrag();
            document.removeEventListener('mousemove', handleMouseMove.current);
            document.removeEventListener('keyup', handleEscape);
            setPosition({ x: x(), y: y() });
            console.log('pressed');
        }
    };

    const handleMouseDown = e => {
        const pageX = e.pageX;
        const pageY = e.pageY;
        setMoving(true);
        setPosition(position =>
            Object.assign({}, position, {
                coords: {
                    x: pageX,
                    y: pageY,
                },
            }),
        );
        document.addEventListener('mousemove', handleMouseMove.current);
        document.addEventListener('keyup', handleEscape);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove.current);
        setPosition(position =>
            Object.assign({}, position, {
                coords: {},
            }),
        );
        setMoving(false);
        endDrag();
    };

    function endDrag() {
        let moved = {
            x: position.x,
            y: position.y,
        };
        props.onMove(moved);
    }

    useEffect(() => {
        setPosition({
            x: x(),
            y: y(),
            coords: {},
        });
    }, [x, y]);

    return (
        <g
            key={'movable_' + props.id}
            className={'draggable'}
            style={{ cursor: moving ? 'grabbing' : 'grab' }}
            onMouseDown={e => handleMouseDown(e)}
            onMouseUp={e => handleMouseUp(e)}
            id={'movable_' + props.id}
            transform={
                'translate(' +
                (props.fixedX ? x() : position.x) +
                ',' +
                (props.fixedY ? y() : position.y) +
                ')'
            }
        >
            {props.children}
        </g>
    );
}

export default RelativeMovable;
