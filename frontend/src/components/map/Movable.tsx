import React, {MouseEvent, useCallback, useEffect, useRef} from 'react';

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
    const positionRef = useRef(position);
    const movingRef = useRef(false);
    const handleMouseMoveRef = useRef<((e: globalThis.MouseEvent) => void) | null>(null);
    const handleMouseUpRef = useRef<(() => void) | null>(null);
    const handleEscapeRef = useRef<((k: KeyboardEvent) => void) | null>(null);

    const updatePositionState = useCallback((updater: React.SetStateAction<Position>) => {
        setPosition(previousPosition => {
            const nextPosition = typeof updater === 'function' ? updater(previousPosition) : updater;
            positionRef.current = nextPosition;
            return nextPosition;
        });
    }, []);

    const handleMouseMove = useCallback(
        (e: globalThis.MouseEvent) => {
            updatePositionState(position => {
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
        [props.scaleFactor, updatePositionState],
    );

    handleMouseMoveRef.current = handleMouseMove;

    const handleMouseDown = (e: MouseEvent<SVGGElement>) => {
        // Only initiate drag on left mouse button (button 0)
        if (e.button !== 0) {
            return;
        }

        setMoving(true);
        movingRef.current = true;
        const pageX = e.pageX;
        const pageY = e.pageY;

        updatePositionState(position =>
            Object.assign({}, position, {
                coords: {
                    x: pageX,
                    y: pageY,
                },
            }),
        );
        document.addEventListener('mousemove', handleMouseMove);
        if (handleMouseUpRef.current) {
            document.addEventListener('mouseup', handleMouseUpRef.current);
        }
        if (handleEscapeRef.current) {
            document.addEventListener('keyup', handleEscapeRef.current);
        }
    };

    const handleEscape = (k: KeyboardEvent) => {
        if (k.key === 'Escape' && movingRef.current) {
            if (handleMouseMoveRef.current) {
                document.removeEventListener('mousemove', handleMouseMoveRef.current);
            }
            if (handleMouseUpRef.current) {
                document.removeEventListener('mouseup', handleMouseUpRef.current);
            }
            if (handleEscapeRef.current) {
                document.removeEventListener('keyup', handleEscapeRef.current);
            }
            movingRef.current = false;
            setMoving(false);
            endDrag();
            updatePositionState({x: x(), y: y(), coords: {}});
        }
    };
    handleEscapeRef.current = handleEscape;

    const handleMouseUp = () => {
        if (!movingRef.current) {
            return;
        }

        if (handleMouseMoveRef.current) {
            document.removeEventListener('mousemove', handleMouseMoveRef.current);
        }
        if (handleMouseUpRef.current) {
            document.removeEventListener('mouseup', handleMouseUpRef.current);
        }
        if (handleEscapeRef.current) {
            document.removeEventListener('keyup', handleEscapeRef.current);
        }
        updatePositionState(position =>
            Object.assign({}, position, {
                coords: {},
            }),
        );
        movingRef.current = false;
        setMoving(false);
        endDrag();
    };
    handleMouseUpRef.current = handleMouseUp;

    function endDrag() {
        const moved: MovedPosition = {
            x: positionRef.current.x,
            y: positionRef.current.y,
        };
        props.onMove(moved);
    }

    useEffect(() => {
        updatePositionState({
            x: x(),
            y: y(),
            coords: {},
        });
    }, [x, y, updatePositionState]);

    useEffect(() => {
        return () => {
            if (handleMouseMoveRef.current) {
                document.removeEventListener('mousemove', handleMouseMoveRef.current);
            }
            if (handleMouseUpRef.current) {
                document.removeEventListener('mouseup', handleMouseUpRef.current);
            }
            if (handleEscapeRef.current) {
                document.removeEventListener('keyup', handleEscapeRef.current);
            }
        };
    }, []);

    return (
        <g
            className={'draggable'}
            style={{cursor: moving ? 'grabbing' : 'grab'}}
            onMouseDown={e => handleMouseDown(e)}
            id={`modern_movable_${props.id}`}
            transform={'translate(' + (props.fixedX ? x() : position.x) + ',' + (props.fixedY ? y() : position.y) + ')'}>
            <rect x="-15" y="-15" rx="30" ry="30" width="30" height="30" fillOpacity={shouldShowMoving && moving ? 0.2 : 0.0} />
            {props.children}
        </g>
    );
};

export default Movable;
