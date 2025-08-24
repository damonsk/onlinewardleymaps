import React from 'react';
import {MapDimensions} from '../../../constants/defaults';
import {PSTBounds, PSTCoordinates, PSTElement, ResizeHandle} from '../../../types/map/pst';
import {MapTheme} from '../../../types/map/styles';
import {convertPSTCoordinatesToBounds} from '../../../utils/pstCoordinateUtils';
import PSTBox from '../PSTBox';
import ResizePreview from '../ResizePreview';

interface PSTRendererProps {
    pstElements: PSTElement[];
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    scaleFactor: number;
    mapText: string;
    mutateMapText: (text: string) => void;

    // PST interaction states
    hoveredPSTElement?: PSTElement | null;
    resizingPSTElement?: PSTElement | null;
    draggingPSTElement?: PSTElement | null;
    resizeHandle?: ResizeHandle | null;
    resizePreviewBounds?: PSTBounds | null;
    dragPreviewBounds?: PSTBounds | null;
    keyboardModifiers?: {maintainAspectRatio: boolean; resizeFromCenter: boolean};

    // PST interaction handlers
    onPSTHover?: (element: PSTElement | null) => void;
    onPSTResizeStart?: (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
    onPSTResizeMove?: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
    onPSTResizeEnd?: (element: PSTElement, newCoordinates: PSTCoordinates) => void;
    onPSTDragStart?: (element: PSTElement, startPosition: {x: number; y: number}) => void;
    onPSTDragMove?: (element: PSTElement, currentPosition: {x: number; y: number}) => void;
    onPSTDragEnd?: (element: PSTElement) => void;
}

export const PSTRenderer: React.FC<PSTRendererProps> = ({
    pstElements,
    mapDimensions,
    mapStyleDefs,
    scaleFactor,
    mapText,
    mutateMapText,
    hoveredPSTElement,
    resizingPSTElement,
    draggingPSTElement,
    resizeHandle,
    resizePreviewBounds,
    dragPreviewBounds,
    keyboardModifiers,
    onPSTHover,
    onPSTResizeStart,
    onPSTResizeMove,
    onPSTResizeEnd,
    onPSTDragStart,
    onPSTDragMove,
    onPSTDragEnd,
}) => {
    return (
        <g id="pst-content">
            <g id="pst-elements">
                {pstElements.map((pstElement: PSTElement) => (
                    <PSTBox
                        key={pstElement.id}
                        pstElement={pstElement}
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        scaleFactor={scaleFactor}
                        isHovered={hoveredPSTElement?.id === pstElement.id}
                        isResizing={resizingPSTElement?.id === pstElement.id}
                        isDragging={draggingPSTElement?.id === pstElement.id}
                        keyboardModifiers={keyboardModifiers}
                        onResizeStart={(element, handle, startPosition) => {
                            try {
                                if (onPSTResizeStart) {
                                    onPSTResizeStart(element, handle, startPosition);
                                }
                            } catch (error) {
                                console.error('Error in PST resize start coordination:', error);
                            }
                        }}
                        onResizeMove={(handle, currentPosition) => {
                            try {
                                if (onPSTResizeMove) {
                                    onPSTResizeMove(handle, currentPosition);
                                }
                            } catch (error) {
                                console.error('Error in PST resize move coordination:', error);
                            }
                        }}
                        onResizeEnd={(element, newCoordinates) => {
                            try {
                                if (onPSTResizeEnd) {
                                    onPSTResizeEnd(element, newCoordinates);
                                }
                            } catch (error) {
                                console.error('Error in PST resize end coordination:', error);
                            }
                        }}
                        onHover={element => {
                            try {
                                if (onPSTHover) {
                                    onPSTHover(element);
                                }
                            } catch (error) {
                                console.error('Error in PST hover coordination:', error);
                            }
                        }}
                        onDragStart={(element, startPosition) => {
                            try {
                                if (onPSTDragStart) {
                                    onPSTDragStart(element, startPosition);
                                }
                            } catch (error) {
                                console.error('Error in PST drag start coordination:', error);
                            }
                        }}
                        onDragMove={(element, currentPosition) => {
                            try {
                                if (onPSTDragMove) {
                                    onPSTDragMove(element, currentPosition);
                                }
                            } catch (error) {
                                console.error('Error in PST drag move coordination:', error);
                            }
                        }}
                        onDragEnd={element => {
                            try {
                                if (onPSTDragEnd) {
                                    onPSTDragEnd(element);
                                }
                            } catch (error) {
                                console.error('Error in PST drag end coordination:', error);
                            }
                        }}
                        mutateMapText={mutateMapText}
                        mapText={mapText}
                    />
                ))}
            </g>

            {/* Resize preview overlay */}
            {resizePreviewBounds && resizingPSTElement && (
                <ResizePreview
                    isActive={true}
                    originalBounds={convertPSTCoordinatesToBounds(resizingPSTElement.coordinates, mapDimensions)}
                    previewBounds={resizePreviewBounds}
                    pstType={resizingPSTElement.type}
                    mapStyleDefs={mapStyleDefs}
                />
            )}

            {/* Drag preview overlay */}
            {dragPreviewBounds && draggingPSTElement && (
                <rect
                    x={dragPreviewBounds.x}
                    y={dragPreviewBounds.y}
                    width={dragPreviewBounds.width}
                    height={dragPreviewBounds.height}
                    fill="none"
                    stroke="#FF9800"
                    strokeWidth={2}
                    strokeDasharray="8,4"
                    opacity={0.6}
                    pointerEvents="none"
                    rx={4}
                    ry={4}
                />
            )}
        </g>
    );
};
