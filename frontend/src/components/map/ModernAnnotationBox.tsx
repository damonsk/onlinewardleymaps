import React, { useCallback, useEffect, useState } from 'react';
import { MapTheme } from '../../constants/mapstyles';
import { MapAnnotations } from '../../types/base';
import ModernAnnotationBoxSymbol from '../symbols/ModernAnnotationBoxSymbol';
import ModernAnnotationTextSymbol from '../symbols/ModernAnnotationTextSymbol';
import ModernMovable from './ModernMovable';
import ModernPositionCalculator from './ModernPositionCalculator';
import ModernRelativeMovable from './ModernRelativeMovable';
import ModernDefaultPositionUpdater from './positionUpdaters/ModernDefaultPositionUpdater';
import { ModernExistingCoordsMatcher } from './positionUpdaters/ModernExistingCoordsMatcher';
import ModernSingletonPositionUpdater from './positionUpdaters/ModernSingletonPositionUpdater';

interface ModernAnnotationBoxProps {
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
    mapStyleDefs: MapTheme;
    annotations: MapAnnotations[];
    scaleFactor: number;
    setHighlightLine?: (line: number) => void;
}

interface MovedPosition {
    x: number;
    y: number;
}

/**
 * ModernAnnotationBox - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders an annotation box with all annotations
 */
const ModernAnnotationBox: React.FC<ModernAnnotationBoxProps> = (props) => {
    const positionCalc = new ModernPositionCalculator();
    const identifier = 'annotations';
    // Removed unused state variable boxBounds
    const [, setBoxBounds] = useState<DOMRect | null>(null);

    const defaultPositionUpdater = new ModernDefaultPositionUpdater(
        identifier,
        props.mapText,
        props.mutateMapText,
        [ModernExistingCoordsMatcher],
    );
    const positionUpdater = new ModernSingletonPositionUpdater(
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

    // Function to handle dragging the entire annotation box
    // Now handles both the box position and updates label position
    function endDrag(moved: MovedPosition): void {
        const visibility = parseFloat(
            positionCalc.yToVisibility(moved.y, props.mapDimensions.height),
        );
        const maturity = parseFloat(
            positionCalc.xToMaturity(moved.x, props.mapDimensions.width),
        );
        
        // Update both the box position and the label position in one operation
        // First update using the position updater
        positionUpdater.update({ param1: visibility, param2: maturity }, '');
        
        // Then update the annotation text coordinates in the mapText
        props.mutateMapText(
            props.mapText
                .split('\n')
                .map((line: string) => {
                    // Match the annotations line specifically
                    if (line.trim().indexOf('annotations') === 0) {
                        return line.replace(
                            /\[(.+?)\]/g,
                            `[${visibility.toFixed(2)}, ${maturity.toFixed(2)}]`,
                        );
                    }
                    return line;
                })
                .join('\n'),
        );
    }

    const redraw = useCallback(() => {
        const elem = document.getElementById('annotationsBoxWrap');
        if (elem !== null) elem.parentNode?.removeChild(elem);

        const ctx = document.getElementById(
            'movable_annotationsBox',
        ) as unknown as SVGGraphicsElement;

        // Add null check before calling getBBox()
        if (!ctx) {
            console.warn('Element with ID "movable_annotationsBox" not found');
            return;
        }

        const SVGRect = ctx.getBBox();
        setBoxBounds(SVGRect);

        const rect = document.createElementNS(
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

        // Insert before text container to ensure box is behind text
        if (ctx.firstChild) {
            ctx.insertBefore(rect, ctx.firstChild);
        } else {
            ctx.appendChild(rect);
        }
    }, [props.mapStyleDefs]);

    useEffect(() => {
        // Use a short timeout to ensure the DOM is ready
        const timer = setTimeout(() => {
            redraw();
        }, 50);

        return () => clearTimeout(timer);
    }, [
        props.position.maturity,
        props.position.visibility,
        props.mapDimensions,
        props.mapStyleDefs,
        props.annotations,
        redraw,
    ]);

    // Simplified structure - using a single Movable component
    // Instead of nesting ModernRelativeMovable inside ModernMovable
    return (
        <ModernMovable
            id={'annotationsBox'}
            onMove={endDrag}
            fixedY={false}
            fixedX={false}
            x={x()}
            y={y()}
            scaleFactor={props.scaleFactor}
        >
            <g id="movable_annotationsBox">
                {/* The annotation box rect will be inserted here via redraw() */}
                <ModernAnnotationBoxSymbol
                    id={'annotationsBoxTextContainer'}
                    dy={0}
                    x={2}
                    theme={props.mapStyleDefs.annotation}
                >
                    {props.annotations &&
                        props.annotations.map((a, i) => (
                            <ModernAnnotationTextSymbol
                                key={i}
                                annotation={a}
                                styles={props.mapStyleDefs.annotation}
                            />
                        ))}
                </ModernAnnotationBoxSymbol>
            </g>
        </ModernMovable>
    );
};

export default ModernAnnotationBox;
