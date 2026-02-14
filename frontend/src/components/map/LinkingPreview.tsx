import React, {memo} from 'react';
import {useI18n} from '../../hooks/useI18n';
import {MapTheme} from '../../constants/mapstyles';
import {UnifiedComponent} from '../../types/unified/components';
import PositionCalculator from './PositionCalculator';

export interface LinkingPreviewProps {
    linkingState: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent: UnifiedComponent | null;
    mousePosition: {x: number; y: number};
    highlightedComponent: UnifiedComponent | null;
    mapStyleDefs: MapTheme;
    mapDimensions: {width: number; height: number};
    isDuplicateLink?: boolean;
    isInvalidTarget?: boolean;
    showCancellationHint?: boolean;
    isSourceDeleted?: boolean;
    isTargetDeleted?: boolean;
}

/**
 * LinkingPreview component shows visual feedback during component linking process
 * - Shows preview line from source component to mouse cursor
 * - Highlights components with magnetic effect when hovering
 */
export const LinkingPreview: React.FC<LinkingPreviewProps> = memo(
    ({
        linkingState,
        sourceComponent,
        mousePosition,
        highlightedComponent,
        mapStyleDefs,
        mapDimensions,
        isDuplicateLink = false,
        isInvalidTarget = false,
        showCancellationHint = false,
        isSourceDeleted = false,
        isTargetDeleted = false,
    }) => {
        const {t} = useI18n();

        // Don't render anything if not in linking mode
        if (linkingState === 'idle') {
            return null;
        }

        const strokeColor = mapStyleDefs.component?.stroke || '#007bff';
        const highlightColor = '#007bff';
        const errorColor = '#dc3545';
        const warningColor = '#ffc107';
        const previewOpacity = 0.6;
        const getComponentSizeClass = (component: UnifiedComponent | null): 'default' | 'market' | 'ecosystem' => {
            if (!component) return 'default';
            if (component.type === 'ecosystem' || component.decorators?.ecosystem === true) return 'ecosystem';
            if (component.type === 'market' || component.decorators?.market === true) return 'market';
            return 'default';
        };

        const sourceSizeClass = getComponentSizeClass(sourceComponent);
        const highlightedSizeClass = getComponentSizeClass(highlightedComponent);

        const sourceBaseRadius = sourceSizeClass === 'ecosystem' ? 32 : sourceSizeClass === 'market' ? 18 : 12;
        const sourcePulseRadius = sourceSizeClass === 'ecosystem' ? 44 : sourceSizeClass === 'market' ? 24 : 16;
        const highlightedBaseRadius = highlightedSizeClass === 'ecosystem' ? 32 : highlightedSizeClass === 'market' ? 18 : 12;
        const highlightedPulseRadius = highlightedSizeClass === 'ecosystem' ? 44 : highlightedSizeClass === 'market' ? 24 : 16;
        const targetBaseRadius = highlightedSizeClass === 'ecosystem' ? 32 : highlightedSizeClass === 'market' ? 16 : 10;
        const targetPulseRadius = highlightedSizeClass === 'ecosystem' ? 44 : highlightedSizeClass === 'market' ? 22 : 14;

        // Determine colors based on link validity
        const getPreviewColor = () => {
            if (isSourceDeleted || isTargetDeleted) return errorColor;
            if (isDuplicateLink) return warningColor;
            if (isInvalidTarget) return errorColor;
            return strokeColor;
        };

        const getHighlightColor = () => {
            if (isSourceDeleted || isTargetDeleted) return errorColor;
            if (isDuplicateLink) return warningColor;
            if (isInvalidTarget) return errorColor;
            return highlightColor;
        };

        // Position calculator for coordinate conversion
        const positionCalculator = new PositionCalculator();

        // Convert map coordinates (0-1) to SVG coordinates
        const convertToSVG = (maturity: number, visibility: number) => {
            const svgX = positionCalculator.maturityToX(maturity, mapDimensions.width);
            const svgY = positionCalculator.visibilityToY(visibility, mapDimensions.height);
            return {x: svgX, y: svgY};
        };

        // Convert mouse position to SVG coordinates
        const mouseSVG = convertToSVG(mousePosition.x, mousePosition.y);

        // Convert source component position to SVG coordinates
        const sourceSVG = sourceComponent ? convertToSVG(sourceComponent.maturity, sourceComponent.visibility) : null;

        // Convert highlighted component position to SVG coordinates
        const highlightedSVG = highlightedComponent ? convertToSVG(highlightedComponent.maturity, highlightedComponent.visibility) : null;

        return (
            <g className="linking-preview">
                {/* Preview line from source to target (snaps to highlighted component or follows mouse) */}
                {linkingState === 'selecting-target' && sourceComponent && sourceSVG && (
                    <line
                        x1={sourceSVG.x}
                        y1={sourceSVG.y}
                        x2={highlightedComponent && highlightedSVG ? highlightedSVG.x : mouseSVG.x}
                        y2={highlightedComponent && highlightedSVG ? highlightedSVG.y : mouseSVG.y}
                        stroke={getPreviewColor()}
                        strokeWidth="2"
                        strokeDasharray={
                            isDuplicateLink || isInvalidTarget || isSourceDeleted || isTargetDeleted
                                ? '3,3'
                                : highlightedComponent && highlightedSVG
                                  ? 'none'
                                  : '5,5'
                        }
                        opacity={highlightedComponent && highlightedSVG ? 0.8 : previewOpacity}
                        pointerEvents="none"
                    />
                )}

                {/* Highlight source component (when selected) */}
                {sourceComponent && sourceSVG && (
                    <circle
                        cx={sourceSVG.x}
                        cy={sourceSVG.y}
                        r={sourceBaseRadius}
                        fill="none"
                        stroke={getHighlightColor()}
                        strokeWidth="3"
                        opacity={0.8}
                        pointerEvents="none">
                        <animate attributeName="r" values={`${sourceBaseRadius};${sourcePulseRadius};${sourceBaseRadius}`} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}

                {/* Highlight potential source component (when selecting source) */}
                {linkingState === 'selecting-source' && !sourceComponent && highlightedComponent && highlightedSVG && (
                    <circle
                        cx={highlightedSVG.x}
                        cy={highlightedSVG.y}
                        r={highlightedBaseRadius}
                        fill="none"
                        stroke={highlightColor}
                        strokeWidth="3"
                        opacity={0.8}
                        pointerEvents="none">
                        <animate
                            attributeName="r"
                            values={`${highlightedBaseRadius};${highlightedPulseRadius};${highlightedBaseRadius}`}
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                )}

                {/* Highlight potential target component (when selecting target) */}
                {linkingState === 'selecting-target' &&
                    highlightedComponent &&
                    highlightedComponent !== sourceComponent &&
                    highlightedSVG && (
                        <circle
                            cx={highlightedSVG.x}
                            cy={highlightedSVG.y}
                            r={targetBaseRadius}
                            fill="none"
                            stroke={getHighlightColor()}
                            strokeWidth="2"
                            opacity={0.9}
                            pointerEvents="none">
                            <animate attributeName="r" values={`${targetBaseRadius};${targetPulseRadius};${targetBaseRadius}`} dur="1s" repeatCount="indefinite" />
                        </circle>
                    )}

                {/* Error indicator for duplicate links, invalid targets, or deleted components */}
                {(isDuplicateLink || isInvalidTarget || isSourceDeleted || isTargetDeleted) && highlightedComponent && highlightedSVG && (
                    <g>
                        {/* X mark for invalid links */}
                        <line
                            x1={highlightedSVG.x - 6}
                            y1={highlightedSVG.y - 6}
                            x2={highlightedSVG.x + 6}
                            y2={highlightedSVG.y + 6}
                            stroke={getHighlightColor()}
                            strokeWidth="3"
                            opacity={0.9}
                            pointerEvents="none"
                        />
                        <line
                            x1={highlightedSVG.x + 6}
                            y1={highlightedSVG.y - 6}
                            x2={highlightedSVG.x - 6}
                            y2={highlightedSVG.y + 6}
                            stroke={getHighlightColor()}
                            strokeWidth="3"
                            opacity={0.9}
                            pointerEvents="none"
                        />
                    </g>
                )}

                {/* Cancellation hint when no component is highlighted */}
                {showCancellationHint && !highlightedComponent && (
                    <g>
                        {/* Background for text */}
                        <rect
                            x={mouseSVG.x - 60}
                            y={mouseSVG.y - 25}
                            width="120"
                            height="20"
                            fill="rgba(0, 0, 0, 0.8)"
                            rx="4"
                            ry="4"
                            pointerEvents="none"
                        />
                        {/* Hint text */}
                        <text
                            x={mouseSVG.x}
                            y={mouseSVG.y - 10}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontFamily="Arial, sans-serif"
                            pointerEvents="none">
                            {t('map.feedback.linking.clickToCancel', 'Click to cancel')}
                        </text>
                    </g>
                )}

                {/* Error message for deleted components */}
                {(isSourceDeleted || isTargetDeleted) && (
                    <g>
                        {/* Background for error text */}
                        <rect
                            x={mouseSVG.x - 80}
                            y={mouseSVG.y + 15}
                            width="160"
                            height="20"
                            fill="rgba(220, 53, 69, 0.9)"
                            rx="4"
                            ry="4"
                            pointerEvents="none"
                        />
                        {/* Error text */}
                        <text
                            x={mouseSVG.x}
                            y={mouseSVG.y + 30}
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontFamily="Arial, sans-serif"
                            pointerEvents="none">
                            {isSourceDeleted
                                ? t('map.feedback.linking.sourceDeleted', 'Source component deleted')
                                : t('map.feedback.linking.targetDeleted', 'Target component deleted')}
                        </text>
                    </g>
                )}

                {/* Duplicate link warning */}
                {isDuplicateLink && highlightedComponent && linkingState === 'selecting-target' && (
                    <g>
                        {/* Background for warning text */}
                        <rect
                            x={mouseSVG.x - 70}
                            y={mouseSVG.y + 15}
                            width="140"
                            height="20"
                            fill="rgba(255, 193, 7, 0.9)"
                            rx="4"
                            ry="4"
                            pointerEvents="none"
                        />
                        {/* Warning text */}
                        <text
                            x={mouseSVG.x}
                            y={mouseSVG.y + 30}
                            textAnchor="middle"
                            fill="black"
                            fontSize="12"
                            fontFamily="Arial, sans-serif"
                            pointerEvents="none">
                            {t('map.feedback.linking.duplicateLinkShort', 'Link already exists')}
                        </text>
                    </g>
                )}
            </g>
        );
    },
);

LinkingPreview.displayName = 'LinkingPreview';

export default LinkingPreview;
