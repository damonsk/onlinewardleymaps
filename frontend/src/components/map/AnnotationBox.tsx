import { useCallback, useEffect } from 'react';
import AnnotationBoxSymbol from '../symbols/AnnotationBoxSymbol';
import AnnotationTextSymbol from '../symbols/AnnotationTextSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import SingletonPositionUpdater from './positionUpdaters/SingletonPositionUpdater';

interface AnnotationElementProps {
    mapText: any;
    mutateMapText: (text: string) => void;
    position: {
        maturity: number;
        visibility: number;
    };
    mapDimensions: {
        width: number;
        height: number;
    };
    mapStyleDefs: {
        annotation: {
            boxStroke: string;
            boxStrokeWidth: number;
            boxFill: string;
        };
    };
    annotations: any[];
    scaleFactor: number;
}

function AnnotationElement(props: AnnotationElementProps) {
    const positionCalc = new PositionCalculator();
    const identifier = 'annotations';

    const defaultPositionUpdater = new DefaultPositionUpdater(
        identifier,
        props.mapText,
        props.mutateMapText,
        [ExistingCoordsMatcher],
    );
    const positionUpdater = new SingletonPositionUpdater(
        identifier,
        props.mapText,
        props.mutateMapText,
    );
    positionUpdater.setSuccessor(defaultPositionUpdater);

    const x = (): number =>
        positionCalc.maturityToX(
            props.position.maturity,
            props.mapDimensions.width,
        );
    const y = (): number =>
        positionCalc.visibilityToY(
            props.position.visibility,
            props.mapDimensions.height,
        );

    function endDrag(moved: { x: number; y: number }): void {
        const visibility = parseFloat(
            positionCalc.yToVisibility(moved.y, props.mapDimensions.height),
        );
        const maturity = parseFloat(
            positionCalc.xToMaturity(moved.x, props.mapDimensions.width),
        );
        positionUpdater.update({ param1: visibility, param2: maturity }, '');
    }

    const redraw = useCallback(() => {
        const elem = document.getElementById('annotationsBoxWrap');
        if (elem !== null) elem.parentNode?.removeChild(elem);

        const ctx = (document.getElementById(
                'movable_annotationsBox',
            ) as unknown) as SVGGraphicsElement,
            SVGRect = ctx.getBBox(),
            rect = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'rect',
            );

        rect.setAttribute('x', (SVGRect.x - 2).toString());
        rect.setAttribute('id', 'annotationsBoxWrap');
        rect.setAttribute('y', (SVGRect.y - 2).toString());
        rect.setAttribute('class', 'draggable');
        rect.setAttribute('width', (SVGRect.width + 4).toString());
        rect.setAttribute('height', (SVGRect.height + 4).toString());
        rect.setAttribute('stroke', props.mapStyleDefs.annotation.boxStroke);
        rect.setAttribute(
            'stroke-width',
            props.mapStyleDefs.annotation.boxStrokeWidth.toString(),
        );
        rect.setAttribute('fill', props.mapStyleDefs.annotation.boxFill);
        ctx.insertBefore(
            rect,
            document.getElementById('annotationsBoxTextContainer') as Node,
        );
    }, [props.mapStyleDefs]);

    useEffect(() => {
        redraw();
    }, [
        props.position.maturity,
        props.position.visibility,
        props.mapDimensions,
        props.mapStyleDefs,
        props.annotations,
        redraw,
    ]);

    return (
        <Movable
            id={'annotationsBox'}
            onMove={endDrag}
            fixedY={false}
            fixedX={false}
            x={x()}
            y={y()}
            scaleFactor={props.scaleFactor}
        >
            <AnnotationBoxSymbol
                id={'annotationsBoxTextContainer'}
                dy={0}
                x={2}
                theme={props.mapStyleDefs.annotation}
            >
                {props.annotations.map((a, i) => (
                    <AnnotationTextSymbol
                        key={i}
                        annotation={a}
                        // parentIndex={i}
                        styles={props.mapStyleDefs.annotation}
                    />
                ))}
            </AnnotationBoxSymbol>
        </Movable>
    );
}

export default AnnotationElement;
