import React from 'react';
import {MapTheme} from '../../constants/mapstyles';
import {MapAnnotation, MapAnnotations} from '../../types/base';
import ModernAnnotationElementSymbol from '../symbols/ModernAnnotationElementSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';

interface MapDimensions {
    width: number;
    height: number;
}

interface ModernAnnotationElementProps {
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

/**
 * AnnotationElement - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders a movable annotation element with number indicator
 */
const AnnotationElement: React.FC<ModernAnnotationElementProps> = ({
    occurance,
    annotation,
    mapDimensions,
    mutateMapText,
    mapText,
    occuranceIndex,
    scaleFactor,
    mapStyleDefs,
}) => {
    const positionCalc = new ModernPositionCalculator();

    const x = (): number => positionCalc.maturityToX(occurance.maturity, mapDimensions.width);

    const y = (): number => positionCalc.visibilityToY(occurance.visibility, mapDimensions.height);

    function endDrag(moved: MovedPosition): void {
        mutateMapText(
            mapText
                .split('\n')
                .map(line => {
                    const normalizedLine = line.replace(/\s/g, '');
                    const searchPattern = `annotation${annotation.number}[`;

                    if (normalizedLine.indexOf(searchPattern) !== -1) {
                        if (normalizedLine.indexOf(']]') > -1) {
                            const extractedOccurances = line.replace(/\s/g, '').split('[[')[1].split(']]')[0].split('],[');

                            const newVisibility = positionCalc.yToVisibility(moved.y, mapDimensions.height);
                            const newMaturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
                            extractedOccurances[occuranceIndex] = `${newVisibility},${newMaturity}`;
                            const beforeCoords = line.split('[')[0].trim();
                            const afterCoords = line.substr(line.lastIndexOf(']'), line.length - line.lastIndexOf(']'));
                            const newCoords = `[${extractedOccurances
                                .map(e => {
                                    return `[${e.trim()}]`;
                                })
                                .join(',')}`;
                            return `${beforeCoords} ${newCoords}${afterCoords}`;
                        }
                        return line.replace(
                            /\[(.+?)\]/g,
                            `[${positionCalc.yToVisibility(
                                moved.y,
                                mapDimensions.height,
                            )}, ${positionCalc.xToMaturity(moved.x, mapDimensions.width)}]`,
                        );
                    }
                    return line;
                })
                .join('\n'),
        );
    }

    return (
        <Movable
            id={`modern_annotation_element_${annotation.number}`}
            onMove={endDrag}
            x={x()}
            y={y()}
            fixedY={false}
            fixedX={false}
            scaleFactor={scaleFactor}>
            <ModernAnnotationElementSymbol
                id={`modern_annotation_element_symbol_${annotation.number}`}
                annotation={annotation}
                styles={mapStyleDefs.annotation}
            />
        </Movable>
    );
};

export default AnnotationElement;
