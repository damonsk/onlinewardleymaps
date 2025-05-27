import { JSX } from 'react';
import { MapTheme } from '../../constants/mapstyles';
import { MapAnnotation, MapAnnotations } from '../../conversion/Converter';
import AnnotationElementSymbol from '../symbols/AnnotationElementSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';

interface MapDimensions {
    width: number;
    height: number;
}
interface AnnotationElementProps {
    occurance: MapAnnotation;
    annotation: MapAnnotations;
    mapDimensions: MapDimensions;
    mutateMapText: (text: string) => void;
    mapText: string;
    occuranceIndex: number;
    scaleFactor: number;
    mapStyleDefs: MapTheme;
}

interface MovedPosition {
    x: number;
    y: number;
}

function AnnotationElement(props: AnnotationElementProps): JSX.Element {
    const positionCalc = new PositionCalculator();
    const x = (): number =>
        positionCalc.maturityToX(
            props.occurance.maturity,
            props.mapDimensions.width,
        );
    const y = (): number =>
        positionCalc.visibilityToY(
            props.occurance.visibility,
            props.mapDimensions.height,
        );

    function endDrag(moved: MovedPosition): void {
        props.mutateMapText(
            props.mapText
                .split('\n')
                .map((line) => {
                    if (
                        line
                            .replace(/\s/g, '')
                            .indexOf(
                                'annotation' + props.annotation.number + '[',
                            ) !== -1
                    ) {
                        if (line.replace(/\s/g, '').indexOf(']]') > -1) {
                            const extractedOccurances = line
                                .replace(/\s/g, '')
                                .split('[[')[1]
                                .split(']]')[0]
                                .split('],[');
                            extractedOccurances[props.occuranceIndex] =
                                positionCalc.yToVisibility(
                                    moved.y,
                                    props.mapDimensions.height,
                                ) +
                                ',' +
                                positionCalc.xToMaturity(
                                    moved.x,
                                    props.mapDimensions.width,
                                );
                            const beforeCoords = line.split('[')[0].trim();
                            const afterCoords = line.substr(
                                line.lastIndexOf(']'),
                                line.length - line.lastIndexOf(']'),
                            );
                            const newCoords =
                                '[' +
                                extractedOccurances
                                    .map((e) => {
                                        return '[' + e + ']';
                                    })
                                    .join(',');
                            return (
                                beforeCoords +
                                ' ' +
                                newCoords +
                                ' ' +
                                afterCoords
                            );
                        } else {
                            return line.replace(
                                /\[(.+?)\]/g,
                                `[${positionCalc.yToVisibility(
                                    moved.y,
                                    props.mapDimensions.height,
                                )}, ${positionCalc.xToMaturity(
                                    moved.x,
                                    props.mapDimensions.width,
                                )}]`,
                            );
                        }
                    } else {
                        return line;
                    }
                })
                .join('\n'),
        );
    }
    console.log('AnnotationElement::render', props.occurance);
    return (
        <Movable
            id={'annotation_element_' + props.annotation.number}
            onMove={endDrag}
            x={x()}
            y={y()}
            fixedY={false}
            fixedX={false}
            scaleFactor={props.scaleFactor}
        >
            <AnnotationElementSymbol
                annotation={props.annotation}
                styles={props.mapStyleDefs.annotation}
            />
        </Movable>
    );
}

export default AnnotationElement;
