/**
 * PST Container Component
 * Renders PST elements with resize functionality and map text mutation
 */

import React from 'react';
import {PSTElement} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import PSTResizeManager from './PSTResizeManager';
import PSTBox from './PSTBox';

interface PSTContainerProps {
    /** PST elements to render */
    pstElements: PSTElement[];
    /** Map dimensions for coordinate conversion */
    mapDimensions: MapDimensions;
    /** Map theme for styling */
    mapStyleDefs: MapTheme;
    /** Scale factor for responsive sizing */
    scaleFactor: number;
    /** Current map text */
    mapText: string;
    /** Callback to update map text */
    onMapTextUpdate: (newMapText: string) => void;
}

/**
 * PST Container manages PST elements with resize functionality
 * Coordinates between individual PST boxes and the resize manager
 */
const PSTContainer: React.FC<PSTContainerProps> = ({pstElements, mapDimensions, mapStyleDefs, scaleFactor, mapText, onMapTextUpdate}) => {
    return (
        <PSTResizeManager pstElements={pstElements} mapDimensions={mapDimensions} mapText={mapText} onMapTextUpdate={onMapTextUpdate}>
            {({
                hoveredElement,
                resizingElement,
                draggingElement,
                onPSTHover,
                onPSTResizeStart,
                onPSTResizeMove,
                onPSTResizeEnd,
                onPSTDragStart,
                onPSTDragMove,
                onPSTDragEnd,
                getResizePreviewBounds,
                getDragPreviewBounds,
            }) => (
                <g className="pst-container">
                    {pstElements.map(element => (
                        <PSTBox
                            key={element.id}
                            pstElement={element}
                            mapDimensions={mapDimensions}
                            mapStyleDefs={mapStyleDefs}
                            scaleFactor={scaleFactor}
                            isHovered={hoveredElement?.id === element.id}
                            isResizing={resizingElement?.id === element.id}
                            isDragging={draggingElement?.id === element.id}
                            onResizeStart={onPSTResizeStart}
                            onResizeMove={onPSTResizeMove}
                            onResizeEnd={onPSTResizeEnd}
                            onDragStart={onPSTDragStart}
                            onDragMove={onPSTDragMove}
                            onDragEnd={onPSTDragEnd}
                            onHover={onPSTHover}
                            mutateMapText={onMapTextUpdate}
                            mapText={mapText}
                        />
                    ))}

                    {/* Resize preview overlay */}
                    {resizingElement && (
                        <g className="pst-resize-preview">
                            {(() => {
                                const previewBounds = getResizePreviewBounds(resizingElement);
                                if (!previewBounds) return null;

                                return (
                                    <rect
                                        x={previewBounds.x}
                                        y={previewBounds.y}
                                        width={previewBounds.width}
                                        height={previewBounds.height}
                                        fill="none"
                                        stroke="#2196F3"
                                        strokeWidth={2}
                                        strokeDasharray="4,4"
                                        opacity={0.7}
                                        pointerEvents="none"
                                        rx={4}
                                        ry={4}
                                    />
                                );
                            })()}
                        </g>
                    )}

                    {/* Drag preview overlay */}
                    {draggingElement && (
                        <g className="pst-drag-preview">
                            {(() => {
                                const previewBounds = getDragPreviewBounds(draggingElement);
                                if (!previewBounds) return null;

                                return (
                                    <rect
                                        x={previewBounds.x}
                                        y={previewBounds.y}
                                        width={previewBounds.width}
                                        height={previewBounds.height}
                                        fill="none"
                                        stroke="#FF9800"
                                        strokeWidth={2}
                                        strokeDasharray="8,4"
                                        opacity={0.6}
                                        pointerEvents="none"
                                        rx={4}
                                        ry={4}
                                    />
                                );
                            })()}
                        </g>
                    )}
                </g>
            )}
        </PSTResizeManager>
    );
};

export default PSTContainer;
