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

interface ModernRelativeMovableProps {
    id: string;
    x: number;
    y: number;
    onMove?: (moved: MovedPosition) => void;
    fixedX?: boolean;
    fixedY?: boolean;
    scaleFactor?: number;
    relativeToElementId?: string;
    children: React.ReactNode;
}

const RelativeMovable: React.FC<ModernRelativeMovableProps> = props => {
    const [moving, setMoving] = React.useState(false);
    const [lastClickTime, setLastClickTime] = React.useState(0);
    const [ignoreNextMouseUp, setIgnoreNextMouseUp] = React.useState(false);
    const x = useCallback(() => props.x, [props.x]);
    const y = useCallback(() => props.y, [props.y]);
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

    const handleEscape = (k: KeyboardEvent) => {
        if (k.key === 'Escape' && moving) {
            setMoving(false);
            endDrag();
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('keyup', handleEscape);
            setPosition({x: x(), y: y(), coords: {}});
        }
    };

    const handleMouseDown = (e: MouseEvent<SVGGElement>) => {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;

        // Detect double-click (within 500ms)
        if (timeSinceLastClick < 500) {
            // This is a double-click, don't treat it as a drag
            setIgnoreNextMouseUp(true);
            setLastClickTime(0); // Reset to prevent triple-clicks from being treated as double-clicks
            return;
        }

        setLastClickTime(currentTime);

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
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('keyup', handleEscape);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('keyup', handleEscape);

        // If this mouseUp is from a double-click, don't treat it as end of drag
        if (ignoreNextMouseUp) {
            setIgnoreNextMouseUp(false);
            setMoving(false);
            return;
        }

        setPosition(position =>
            Object.assign({}, position, {
                coords: {},
            }),
        );
        setMoving(false);
        endDrag();
    };

    function endDrag(): void {
        if (props.onMove) {
            // For labels, we want integer coordinates
            const moved: MovedPosition = {
                x: parseInt(position.x.toString(), 10),
                y: parseInt(position.y.toString(), 10),
            };
            console.log('RelativeMovable endDrag:', {
                id: props.id,
                rawPosition: position,
                movedResult: moved,
            });
            props.onMove(moved);
        }
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
            key={`modern_movable_${props.id}`}
            className={'draggable'}
            style={{cursor: moving ? 'grabbing' : 'grab'}}
            onMouseDown={e => handleMouseDown(e)}
            onMouseUp={() => handleMouseUp()}
            id={`modern_movable_${props.id}`}
            transform={'translate(' + (props.fixedX ? x() : position.x) + ',' + (props.fixedY ? y() : position.y) + ')'}>
            {props.children}
        </g>
    );
};

export default RelativeMovable;
