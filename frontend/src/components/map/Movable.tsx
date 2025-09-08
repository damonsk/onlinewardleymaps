import React, {MouseEvent, useCallback, useEffect} from 'react';

interface MovedPosition {
    x: number;
    y: number;
}

interface Position {
    x: number;
    y: number;
    coords: {
        x?: number;
        y?: number;
    };
}

interface ModernMovableProps {
    id: string;
    x: number;
    y: number;
    onMove: (moved: MovedPosition) => void;
    fixedX?: boolean;
    fixedY?: boolean;
    shouldShowMoving?: boolean;
    scaleFactor?: number;
    children: React.ReactNode;
}

const Movable: React.FC<ModernMovableProps> = props => {
    const x = useCallback(() => props.x, [props.x]);
    const y = useCallback(() => props.y, [props.y]);
    const [moving, setMoving] = React.useState(false);
    const shouldShowMoving = props.shouldShowMoving ?? false;
    const [position, setPosition] = React.useState<Position>({
        x: x(),
        y: y(),
        coords: {},
    });

    const handleMouseMove = useCallback(
        (e: globalThis.MouseEvent) => {
            setPosition(position => {
                const scaleFactor = props.scaleFactor || 1;
                const xDiff = (position.coords.x! - e.pageX) / scaleFactor;
                const yDiff = (position.coords.y! - e.pageY) / scaleFactor;
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
        [props.scaleFactor],
    );

    const handleMouseDown = (e: MouseEvent<SVGGElement>) => {
        // Only initiate drag on left mouse button (button 0)
        if (e.button !== 0) {
            return;
        }
        
        setMoving(true);
        const pageX = e.pageX;
        const pageY = e.pageY;

        setPosition(position =>
            Object.assign({}, position, {
                coords: {
                    x: pageX,
                    y: pageY,
                },
            }),
        );
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keyup', handleEscape);
    };

    const handleEscape = (k: KeyboardEvent) => {
        if (k.key === 'Escape' && moving) {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keyup', handleEscape);
            setMoving(false);
            endDrag();
            setPosition({x: x(), y: y(), coords: {}});
        }
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        setPosition(position =>
            Object.assign({}, position, {
                coords: {},
            }),
        );
        setMoving(false);
        endDrag();
    };

    function endDrag() {
        const moved: MovedPosition = {
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
            className={'draggable'}
            style={{cursor: moving ? 'grabbing' : 'grab'}}
            onMouseDown={e => handleMouseDown(e)}
            onMouseUp={() => handleMouseUp()}
            id={`modern_movable_${props.id}`}
            transform={'translate(' + (props.fixedX ? x() : position.x) + ',' + (props.fixedY ? y() : position.y) + ')'}>
            <rect x="-15" y="-15" rx="30" ry="30" width="30" height="30" fillOpacity={shouldShowMoving && moving ? 0.2 : 0.0} />
            {props.children}
        </g>
    );
};

export default Movable;
