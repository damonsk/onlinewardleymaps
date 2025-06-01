import React from 'react';
import { MapAnnotation, MapAnnotations } from '../../types/base';
import { MapTheme } from '../../constants/mapstyles';
import ModernAnnotationElementSymbol from '../symbols/ModernAnnotationElementSymbol';
import ModernMovable from './ModernMovable';
import PositionCalculator from './PositionCalculator';

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
 * ModernAnnotationElement - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders a movable annotation element with number indicator
 */
const ModernAnnotationElement: React.FC<ModernAnnotationElementProps> = ({
    occurance,
    annotation,
    mapDimensions,
    mutateMapText,
    mapText,
    occuranceIndex,
    scaleFactor,
    mapStyleDefs
}) => {
    const positionCalc = new PositionCalculator();
    
    const x = (): number =>
        positionCalc.maturityToX(
            occurance.maturity,
            mapDimensions.width,
        );
        
    const y = (): number =>
        positionCalc.visibilityToY(
            occurance.visibility,
            mapDimensions.height,
        );

    function endDrag(moved: MovedPosition): void {
        mutateMapText(
            mapText
                .split('\n')
                .map((line) => {
                    if (
                        line
                            .replace(/\s/g, '')
                            .indexOf(
                                'annotation' + annotation.number + '[',
                            ) !== -1
                    ) {
                        if (line.replace(/\s/g, '').indexOf(']]') > -1) {
                            const extractedOccurances = line
                                .replace(/\s/g, '')
                                .split('[[')[1]
                                .split(']]')[0]
                                .split('],[');
                            extractedOccurances[occuranceIndex] =
                                positionCalc.yToVisibility(
                                    moved.y,
                                    mapDimensions.height,
                                ) +
                                ',' +
                                positionCalc.xToMaturity(
                                    moved.x,
                                    mapDimensions.width,
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
                                    mapDimensions.height,
                                )}, ${positionCalc.xToMaturity(
                                    moved.x,
                                    mapDimensions.width,
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

    return (
        <ModernMovable
            id={`modern_annotation_element_${annotation.number}`}
            onMove={endDrag}
            x={x()}
            y={y()}
            fixedY={false}
            fixedX={false}
            scaleFactor={scaleFactor}
        >
            <ModernAnnotationElementSymbol
                id={`modern_annotation_element_symbol_${annotation.number}`}
                annotation={annotation}
                styles={mapStyleDefs.annotation}
            />
        </ModernMovable>
    );
};

export default ModernAnnotationElement;
