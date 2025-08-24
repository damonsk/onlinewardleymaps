import React from 'react';
import {MapDimensions} from '../../../constants/defaults';
import {MapTheme} from '../../../types/map/styles';
import {useFeatureSwitches} from '../../FeatureSwitchesContext';
import AnnotationBox from '../AnnotationBox';
import AnnotationElement from '../AnnotationElement';
import DrawingPreview from '../DrawingPreview';
import MapPipelines from '../MapPipelines';
import Note from '../Note';
import {MapElements} from '../../../processing/MapElements';
import {MouseEvent} from 'react';

interface AnnotationRendererProps {
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;

    // Data
    mapNotes: any[];
    mapAnnotations: any[];
    mapAnnotationsPresentation: any;
    mapElements: MapElements;

    // Event handlers
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: {el: any; e: MouseEvent<Element> | null}) => void;

    // Feature flags
    enableNewPipelines: boolean;

    // Drawing functionality props
    isDrawing?: boolean;
    drawingStartPosition?: {x: number; y: number} | null;
    drawingCurrentPosition?: {x: number; y: number};
    selectedToolbarItem?: any;
}

export const AnnotationRenderer: React.FC<AnnotationRendererProps> = ({
    mapDimensions,
    mapStyleDefs,
    mapText,
    mutateMapText,
    scaleFactor,
    mapNotes,
    mapAnnotations,
    mapAnnotationsPresentation,
    mapElements,
    setHighlightLine,
    clicked,
    enableNewPipelines,
    isDrawing,
    drawingStartPosition,
    drawingCurrentPosition,
    selectedToolbarItem,
}) => {
    const featureSwitches = useFeatureSwitches();

    const setHighlightLineDispatch = (value: any) => {
        if (typeof value === 'function') {
            setHighlightLine(value(0));
        } else {
            setHighlightLine(value);
        }
    };

    return (
        <g id="annotation-content">
            {mapAnnotations && mapAnnotations.length > 0 && (
                <AnnotationBox
                    mapStyleDefs={mapStyleDefs}
                    mutateMapText={mutateMapText}
                    mapText={mapText}
                    annotations={mapAnnotations}
                    position={mapAnnotationsPresentation}
                    mapDimensions={mapDimensions}
                    scaleFactor={scaleFactor}
                    setHighlightLine={setHighlightLineDispatch}
                />
            )}

            <MapPipelines
                enableNewPipelines={enableNewPipelines || false}
                mapElements={mapElements}
                mapDimensions={mapDimensions}
                mapText={mapText}
                mutateMapText={mutateMapText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLineDispatch}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

            <g id="notes">
                {mapNotes.map((n: any, i: number) => (
                    <Note
                        key={i}
                        mapDimensions={mapDimensions}
                        note={n}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        scaleFactor={scaleFactor}
                        setHighlightLine={setHighlightLineDispatch}
                        enableInlineEditing={featureSwitches?.enableNoteInlineEditing || false}
                    />
                ))}
            </g>

            <g id="annotations">
                {mapAnnotations &&
                    mapAnnotations.map((a: any, i: number) => (
                        <React.Fragment key={i}>
                            {a.occurances?.map((occurance: any, i1: number) => (
                                <AnnotationElement
                                    mapStyleDefs={mapStyleDefs}
                                    key={'mapAnnotation_' + i + '_' + i1}
                                    occurance={occurance}
                                    annotation={a}
                                    occuranceIndex={i1}
                                    mapDimensions={mapDimensions}
                                    mutateMapText={mutateMapText}
                                    mapText={mapText}
                                    scaleFactor={scaleFactor}
                                />
                            ))}
                        </React.Fragment>
                    ))}
            </g>

            {/* Drawing preview for PST box drawing functionality */}
            <DrawingPreview
                isDrawing={isDrawing || false}
                startPosition={drawingStartPosition || null}
                currentPosition={drawingCurrentPosition || {x: 0, y: 0}}
                selectedPSTType={selectedToolbarItem?.selectedSubItem || null}
                mapStyleDefs={mapStyleDefs}
                mapDimensions={mapDimensions}
            />
        </g>
    );
};
