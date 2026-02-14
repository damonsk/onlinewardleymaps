import React, {useCallback, useEffect, useState} from 'react';
import {MapTheme} from '../../constants/mapstyles';
import {MapAnnotations} from '../../types/base';
import AnnotationBoxSymbol from '../symbols/AnnotationBoxSymbol';
import AnnotationTextSymbol from '../symbols/AnnotationTextSymbol';
import InlineEditor from './InlineEditor';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';
import ModernDefaultPositionUpdater from './positionUpdaters/ModernDefaultPositionUpdater';
import {ModernExistingCoordsMatcher} from './positionUpdaters/ModernExistingCoordsMatcher';
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

export const updateAnnotationLineText = (line: string, annotationNumber: number, annotationText: string): string => {
    const escapedNumber = annotationNumber.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const annotationPattern = new RegExp(`^(\\s*annotation\\s+${escapedNumber}\\s+)(\\[\\[.*?\\]\\]|\\[[^\\]]*\\])(.*)$`);
    const match = line.match(annotationPattern);

    if (!match) return line;

    const [, prefix, coordinates] = match;
    const trimmedText = annotationText.trim();
    return `${prefix}${coordinates}${trimmedText.length > 0 ? ` ${trimmedText}` : ''}`;
};

const AnnotationBox: React.FC<ModernAnnotationBoxProps> = props => {
    const positionCalc = new ModernPositionCalculator();
    const identifier = 'annotations';
    const [, setBoxBounds] = useState<DOMRect | null>(null);
    const [editingAnnotationNumber, setEditingAnnotationNumber] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

    const defaultPositionUpdater = new ModernDefaultPositionUpdater(identifier, props.mapText, props.mutateMapText, [
        ModernExistingCoordsMatcher,
    ]);
    const positionUpdater = new ModernSingletonPositionUpdater(identifier, props.mapText, props.mutateMapText);
    positionUpdater.setSuccessor(defaultPositionUpdater);

    const x = (): number => positionCalc.maturityToX(props.position.maturity, props.mapDimensions.width);

    const y = (): number => positionCalc.visibilityToY(props.position.visibility, props.mapDimensions.height);
    function endDrag(moved: MovedPosition): void {
        const visibility = parseFloat(positionCalc.yToVisibility(moved.y, props.mapDimensions.height));
        const maturity = parseFloat(positionCalc.xToMaturity(moved.x, props.mapDimensions.width));
        positionUpdater.update({param1: visibility, param2: maturity}, '');

        props.mutateMapText(
            props.mapText
                .split('\n')
                .map((line: string) => {
                    if (line.trim().indexOf('annotations') === 0) {
                        return line.replace(/\[(.+?)\]/g, `[${visibility.toFixed(2)}, ${maturity.toFixed(2)}]`);
                    }
                    return line;
                })
                .join('\n'),
        );
    }

    const redraw = useCallback(() => {
        const elem = document.getElementById('annotationsBoxWrap');
        if (elem !== null) elem.parentNode?.removeChild(elem);

        const ctx = document.getElementById('movable_annotationsBox') as unknown as SVGGraphicsElement;

        if (!ctx) {
            console.warn('Element with ID "movable_annotationsBox" not found');
            return;
        }

        const SVGRect = ctx.getBBox();
        setBoxBounds(SVGRect);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        rect.setAttribute('x', (SVGRect.x - 2).toString());
        rect.setAttribute('id', 'annotationsBoxWrap');
        rect.setAttribute('y', (SVGRect.y - 2).toString());
        rect.setAttribute('class', 'draggable');
        rect.setAttribute('width', (SVGRect.width + 4).toString());
        rect.setAttribute('height', (SVGRect.height + 4).toString());
        rect.setAttribute('stroke', props.mapStyleDefs.annotation.boxStroke);
        rect.setAttribute('stroke-width', props.mapStyleDefs.annotation.boxStrokeWidth.toString());
        rect.setAttribute('fill', props.mapStyleDefs.annotation.boxFill);

        if (ctx.firstChild) {
            ctx.insertBefore(rect, ctx.firstChild);
        } else {
            ctx.appendChild(rect);
        }
    }, [props.mapStyleDefs]);

    useEffect(() => {
        const timer = setTimeout(() => {
            redraw();
        }, 50);

        return () => clearTimeout(timer);
    }, [props.position.maturity, props.position.visibility, props.mapDimensions, props.mapStyleDefs, props.annotations, redraw]);

    const handleAnnotationDoubleClick = (annotation: MapAnnotations) => (event: React.MouseEvent<SVGTSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setEditingAnnotationNumber(annotation.number);
        setEditingText(annotation.text || '');
        if (props.setHighlightLine && typeof (annotation as any).line === 'number') {
            props.setHighlightLine((annotation as any).line);
        }
    };

    const handleSaveAnnotation = () => {
        if (editingAnnotationNumber === null) return;

        const updatedMapText = props.mapText
            .split('\n')
            .map((line: string) => updateAnnotationLineText(line, editingAnnotationNumber, editingText))
            .join('\n');

        props.mutateMapText(updatedMapText);
        setEditingAnnotationNumber(null);
    };

    const handleCancelAnnotation = () => {
        setEditingAnnotationNumber(null);
        setEditingText('');
    };

    const editingIndex = editingAnnotationNumber !== null ? props.annotations.findIndex(a => a.number === editingAnnotationNumber) : -1;
    const showInlineEditor = editingAnnotationNumber !== null && editingIndex >= 0;
    const lineHeight = 18;
    const headerOffset = 4;
    const editorHeight = 96;
    const editorY = headerOffset + lineHeight * (editingIndex + 1) - 14;

    return (
        <Movable id={'annotationsBox'} onMove={endDrag} fixedY={false} fixedX={false} x={x()} y={y()} scaleFactor={props.scaleFactor}>
            <g id="movable_annotationsBox">
                <AnnotationBoxSymbol id={'annotationsBoxTextContainer'} dy={0} x={2} theme={props.mapStyleDefs.annotation}>
                    {props.annotations &&
                        props.annotations.map((a, i) => (
                            <AnnotationTextSymbol key={i} annotation={a} styles={props.mapStyleDefs.annotation} onDoubleClick={handleAnnotationDoubleClick(a)} />
                        ))}
                </AnnotationBoxSymbol>
                {showInlineEditor && (
                    <foreignObject x={4} y={editorY} width={280} height={editorHeight} style={{overflow: 'visible'}}>
                        <div style={{width: '100%', height: '100%', position: 'relative'}}>
                            <InlineEditor
                                value={editingText}
                                onChange={setEditingText}
                                onSave={handleSaveAnnotation}
                                onCancel={handleCancelAnnotation}
                                x={0}
                                y={0}
                                width={260}
                                minWidth={220}
                                mapStyleDefs={props.mapStyleDefs}
                                autoFocus={true}
                                selectAllOnFocus={true}
                                showCharacterCount={true}
                                showActionButtons={true}
                                validation={{
                                    maxLength: 500,
                                }}
                            />
                        </div>
                    </foreignObject>
                )}
            </g>
        </Movable>
    );
};

export default AnnotationBox;
