import React, {memo} from 'react';
import {PSTBounds, PSTType} from '../../types/map/pst';
import {MapTheme} from '../../types/map/styles';
import {PST_CONFIG, RESIZE_PREVIEW_OPACITY} from '../../constants/pstConfig';

/**
 * Props interface for the ResizePreview component
 */
export interface ResizePreviewProps {
    /** Whether the resize preview is currently active */
    isActive: boolean;
    /** Original bounds of the PST element before resize */
    originalBounds: PSTBounds;
    /** Preview bounds showing the new dimensions during resize */
    previewBounds: PSTBounds;
    /** PST type for appropriate styling and color coding */
    pstType: PSTType;
    /** Map theme for consistent styling */
    mapStyleDefs: MapTheme;
    /** Whether the current resize operation violates constraints */
    hasConstraintViolation?: boolean;
}

/**
 * ResizePreview component for visual feedback during PST element resize operations
 * Shows a semi-transparent preview of the new dimensions with appropriate PST type styling
 * Provides visual feedback for constraint violations and invalid sizes
 */
export const ResizePreview: React.FC<ResizePreviewProps> = memo(
    ({isActive, originalBounds, previewBounds, pstType, mapStyleDefs, hasConstraintViolation = false}) => {
        // Don't render if not active
        if (!isActive) {
            return null;
        }

        // Get PST type configuration for styling
        const pstConfig = PST_CONFIG[pstType];

        // Calculate preview styling based on constraint violations
        const previewColor = hasConstraintViolation ? '#FF4444' : pstConfig.color;
        const previewOpacity = hasConstraintViolation ? 0.3 : RESIZE_PREVIEW_OPACITY;
        const strokeDashArray = hasConstraintViolation ? '3,3' : '5,5';

        // Calculate label position (center of preview bounds)
        const labelX = previewBounds.x + previewBounds.width / 2;
        const labelY = previewBounds.y + previewBounds.height / 2;

        return (
            <g data-testid="resize-preview" role="img" aria-label={`Resizing ${pstConfig.label} box preview`}>
                {/* Original bounds outline for reference */}
                <rect
                    x={originalBounds.x}
                    y={originalBounds.y}
                    width={originalBounds.width}
                    height={originalBounds.height}
                    fill="none"
                    stroke={pstConfig.color}
                    strokeWidth="1"
                    strokeOpacity="0.3"
                    strokeDasharray="2,2"
                    rx="4"
                    ry="4"
                    data-testid="original-bounds-outline"
                />

                {/* Preview bounds with semi-transparent fill */}
                <rect
                    x={previewBounds.x}
                    y={previewBounds.y}
                    width={previewBounds.width}
                    height={previewBounds.height}
                    fill={previewColor}
                    fillOpacity={previewOpacity * 0.2}
                    stroke={previewColor}
                    strokeWidth="2"
                    strokeOpacity={previewOpacity}
                    strokeDasharray={strokeDashArray}
                    rx="4"
                    ry="4"
                    data-testid="preview-bounds"
                    style={{
                        animation: hasConstraintViolation
                            ? 'constraintViolationPulse 0.5s ease-in-out infinite alternate'
                            : 'resizePreviewPulse 1.5s ease-in-out infinite',
                    }}
                />

                {/* Preview label */}
                <text
                    x={labelX}
                    y={labelY}
                    fill={previewColor}
                    fillOpacity={previewOpacity}
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                    data-testid="preview-label">
                    {pstConfig.label}
                </text>

                {/* Constraint violation indicator */}
                {hasConstraintViolation && (
                    <g data-testid="constraint-violation-indicator">
                        {/* Warning icon */}
                        <circle
                            cx={previewBounds.x + previewBounds.width - 15}
                            cy={previewBounds.y + 15}
                            r="8"
                            fill="#FF4444"
                            fillOpacity="0.9"
                        />
                        <text
                            x={previewBounds.x + previewBounds.width - 15}
                            y={previewBounds.y + 15}
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            pointerEvents="none">
                            !
                        </text>
                    </g>
                )}

                {/* Dimension indicators */}
                <g data-testid="dimension-indicators" opacity={previewOpacity}>
                    {/* Width indicator */}
                    <line
                        x1={previewBounds.x}
                        y1={previewBounds.y - 10}
                        x2={previewBounds.x + previewBounds.width}
                        y2={previewBounds.y - 10}
                        stroke={previewColor}
                        strokeWidth="1"
                        markerStart="url(#dimension-arrow)"
                        markerEnd="url(#dimension-arrow)"
                    />
                    <text
                        x={previewBounds.x + previewBounds.width / 2}
                        y={previewBounds.y - 15}
                        fill={previewColor}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        pointerEvents="none">
                        {Math.round(previewBounds.width)}px
                    </text>

                    {/* Height indicator */}
                    <line
                        x1={previewBounds.x - 10}
                        y1={previewBounds.y}
                        x2={previewBounds.x - 10}
                        y2={previewBounds.y + previewBounds.height}
                        stroke={previewColor}
                        strokeWidth="1"
                        markerStart="url(#dimension-arrow)"
                        markerEnd="url(#dimension-arrow)"
                    />
                    <text
                        x={previewBounds.x - 15}
                        y={previewBounds.y + previewBounds.height / 2}
                        fill={previewColor}
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        pointerEvents="none"
                        transform={`rotate(-90, ${previewBounds.x - 15}, ${previewBounds.y + previewBounds.height / 2})`}>
                        {Math.round(previewBounds.height)}px
                    </text>
                </g>

                {/* SVG definitions for dimension arrows */}
                <defs>
                    <marker id="dimension-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={previewColor} fillOpacity={previewOpacity} />
                    </marker>
                </defs>

                {/* CSS animations */}
                <style>{`
          @keyframes resizePreviewPulse {
            0%, 100% {
              stroke-opacity: ${previewOpacity * 0.6};
              fill-opacity: ${previewOpacity * 0.1};
            }
            50% {
              stroke-opacity: ${previewOpacity};
              fill-opacity: ${previewOpacity * 0.3};
            }
          }
          
          @keyframes constraintViolationPulse {
            0% {
              stroke-opacity: 0.3;
              fill-opacity: 0.1;
            }
            100% {
              stroke-opacity: 0.8;
              fill-opacity: 0.2;
            }
          }
        `}</style>
            </g>
        );
    },
);

ResizePreview.displayName = 'ResizePreview';

export default ResizePreview;
