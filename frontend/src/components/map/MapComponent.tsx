import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {normalizeComponentName} from '../../utils/componentNameMatching';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useComponentLinkHighlight} from '../contexts/ComponentLinkHighlightContext';
import ComponentText from './ComponentText';
import {useContextMenu} from './ContextMenuProvider';
import Inertia from './Inertia';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';

interface MovedPosition {
    x: number;
    y: number;
}

interface ModernMapComponentProps {
    launchUrl?: (url: string) => void;
    mapDimensions: MapDimensions;
    component: UnifiedComponent;
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
    children?: React.ReactNode;
}

const MapComponent: React.FC<ModernMapComponentProps> = ({
    launchUrl,
    mapDimensions,
    component,
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    scaleFactor,
    children,
}) => {
    const {isSelected, selectComponent} = useComponentSelection();
    const {showContextMenu} = useContextMenu();
    const {setHoveredComponent} = useComponentLinkHighlight();
    const calculatedPosition = new ModernPositionCalculator();
    const posX = calculatedPosition.maturityToX(component.maturity, mapDimensions.width);
    const posY = calculatedPosition.visibilityToY(component.visibility, mapDimensions.height) + (component.offsetY ? component.offsetY : 0);
    const [isUncertaintySelected, setIsUncertaintySelected] = React.useState(false);
    const clampMaturity = (value: number) => Math.min(1, Math.max(0, value));
    const lowerOffset =
        typeof component.uncertaintyLowerOffsetMaturity === 'number'
            ? component.uncertaintyLowerOffsetMaturity
            : (component.uncertaintyLowerMaturity ?? component.maturity) - component.maturity;
    const upperOffset =
        typeof component.uncertaintyUpperOffsetMaturity === 'number'
            ? component.uncertaintyUpperOffsetMaturity
            : (component.uncertaintyUpperMaturity ?? component.maturity) - component.maturity;
    const lowerBoundary = clampMaturity(component.maturity + lowerOffset);
    const upperBoundary = clampMaturity(component.maturity + upperOffset);
    const uncertaintyStart = Math.min(lowerBoundary, upperBoundary);
    const uncertaintyEnd = Math.max(lowerBoundary, upperBoundary);
    const shouldRenderUncertainty = uncertaintyEnd - uncertaintyStart > 0;
    const uncertaintyX1 = calculatedPosition.maturityToX(uncertaintyStart, mapDimensions.width);
    const uncertaintyX2 = calculatedPosition.maturityToX(uncertaintyEnd, mapDimensions.width);
    const isWardleyStyle = mapStyleDefs?.className === 'wardley';
    const componentStrokeColor = mapStyleDefs?.component?.stroke || '#6b7280';
    const componentStrokeWidth = mapStyleDefs?.component?.strokeWidth || 1;
    const componentRadius = mapStyleDefs?.component?.radius || 8;
    const uncertaintyBandHeight = componentRadius * 2 + componentStrokeWidth;
    const uncertaintyBandHalfHeight = uncertaintyBandHeight / 2;
    const uncertaintyGradientId = `component-uncertainty-gradient-${component.id}`;
    const uncertaintyCapHalfHeight = Math.max(2, uncertaintyBandHeight * 0.35);
    const clampedComponentMaturity = clampMaturity(component.maturity);
    const uncertaintySpan = Math.max(0, uncertaintyEnd - uncertaintyStart);
    const uncertaintyPeakRatio =
        uncertaintySpan > 0 ? Math.min(1, Math.max(0, (clampedComponentMaturity - uncertaintyStart) / uncertaintySpan)) : 0.5;
    const uncertaintyPeakOffset = `${(uncertaintyPeakRatio * 100).toFixed(2)}%`;

    // Check if this component is currently selected
    const isElementSelected = isSelected(component.id);

    React.useEffect(() => {
        if (!isElementSelected) {
            setIsUncertaintySelected(false);
        }
    }, [isElementSelected]);

    const handleClick = (e: React.MouseEvent) => {
        console.log('MapComponent clicked, selecting component:', component.id);
        e.preventDefault();
        e.stopPropagation();

        // Select this component
        selectComponent(component.id);
        setIsUncertaintySelected(false);

        console.log('Component selected:', component);

        if (component.line) {
            setHighlightLine(component.line);
        }

        if (component.url && launchUrl) {
            if (typeof component.url === 'string') {
                launchUrl(component.url);
            } else if (component.url.url) {
                launchUrl(component.url.url);
            }
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        console.log('MapComponent context menu triggered for:', component.id);
        e.preventDefault();
        e.stopPropagation();

        // Select the component first if not already selected
        if (!isElementSelected) {
            console.log('Selecting component:', component.id);
            selectComponent(component.id);
        } else {
            console.log('Component already selected:', component.id);
        }

        // Show context menu at cursor position
        console.log('Showing context menu at:', {x: e.clientX, y: e.clientY});
        showContextMenu({x: e.clientX, y: e.clientY}, component.id);
    };

    const handleMouseEnter = () => {
        setHoveredComponent(component.name);
    };

    const handleMouseLeave = () => {
        setHoveredComponent(null);
    };

    const updateUncertaintyClause = (line: string, start: number, end: number, addIfMissing: boolean = true): string => {
        const uncertaintyClause = `uncertainty [${start.toFixed(2)}, ${end.toFixed(2)}]`;

        if (/\buncertainty\s*\[[^\]]*\]/i.test(line)) {
            return line.replace(/\buncertainty\s*\[[^\]]*\]/i, uncertaintyClause);
        }

        if (!addIfMissing) {
            return line;
        }

        if (/\blabel\b/i.test(line)) {
            return line.replace(/\blabel\b/i, `${uncertaintyClause} label`);
        }

        return `${line} ${uncertaintyClause}`;
    };

    const updatePosition = (movedPosition: MovedPosition) => {
        if (component.line === undefined) return;

        const calculator = new ModernPositionCalculator();
        const newMaturity = parseFloat(calculator.xToMaturity(movedPosition.x, mapDimensions.width));
        const newVisibility = parseFloat(calculator.yToVisibility(movedPosition.y, mapDimensions.height));

        const lines = mapText.split('\n');

        if (component.evolved) {
            // Handle evolved components - support both old and new evolve formats
            const updatedLines = lines.map(line => {
                // Check for evolve statements
                if (line.trim().startsWith('evolve ')) {
                    const evolveContent = line.trim().substring(7).trim(); // Remove 'evolve '

                    // Check for arrow format: "evolve Source->Evolved maturity"
                    let arrowPos = -1;
                    let inQuotes = false;
                    let escapeNext = false;

                    for (let i = 0; i < evolveContent.length - 1; i++) {
                        const char = evolveContent[i];
                        const nextChar = evolveContent[i + 1];

                        if (escapeNext) {
                            escapeNext = false;
                            continue;
                        }

                        if (char === '\\') {
                            escapeNext = true;
                            continue;
                        }

                        if (char === '"') {
                            inQuotes = !inQuotes;
                            continue;
                        }

                        if (!inQuotes && char === '-' && nextChar === '>') {
                            arrowPos = i;
                            break;
                        }
                    }

                    let evolvedNameInLine = '';

                    if (arrowPos !== -1) {
                        // New format: "evolve Source->Evolved maturity"
                        const remainder = evolveContent.substring(arrowPos + 2).trim();

                        // Parse to separate evolved name from maturity and label
                        const maturityPattern = /\s+([0-9]+(?:\.[0-9]+)?)(\s+label\s+\[[^\]]+\])?$/;
                        const maturityMatch = remainder.match(maturityPattern);

                        let evolvedPart = '';
                        if (maturityMatch) {
                            const maturityStartIndex = remainder.lastIndexOf(maturityMatch[0]);
                            evolvedPart = remainder.substring(0, maturityStartIndex).trim();
                        } else {
                            evolvedPart = remainder;
                        }

                        // Extract evolved component name
                        if (evolvedPart.startsWith('"') && evolvedPart.endsWith('"')) {
                            // Extract quoted evolved name
                            const quotedContent = evolvedPart.slice(1, -1);
                            evolvedNameInLine = quotedContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                        } else {
                            // Unquoted evolved name
                            evolvedNameInLine = evolvedPart;
                        }
                    } else {
                        // Old format: "evolve EvolvedName maturity" (for backwards compatibility)
                        const maturityPattern = /\s+([0-9]+(?:\.[0-9]+)?)(\s+label\s+\[[^\]]+\])?$/;
                        const maturityMatch = evolveContent.match(maturityPattern);

                        let evolvedPart = '';
                        if (maturityMatch) {
                            const maturityStartIndex = evolveContent.lastIndexOf(maturityMatch[0]);
                            evolvedPart = evolveContent.substring(0, maturityStartIndex).trim();
                        } else {
                            evolvedPart = evolveContent;
                        }

                        // Extract evolved component name (same logic as above)
                        if (evolvedPart.startsWith('"') && evolvedPart.endsWith('"')) {
                            const quotedContent = evolvedPart.slice(1, -1);
                            evolvedNameInLine = quotedContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                        } else {
                            evolvedNameInLine = evolvedPart;
                        }
                    }

                    // For evolved components, match against the evolved name (from override or name)
                    let componentNameToMatch = component.name;
                    if (component.evolved) {
                        // Use override if available, otherwise fall back to component name
                        componentNameToMatch = component.override || component.name;
                        if (componentNameToMatch.startsWith('"') && componentNameToMatch.endsWith('"')) {
                            componentNameToMatch = componentNameToMatch
                                .slice(1, -1)
                                .replace(/\\"/g, '"')
                                .replace(/\\n/g, '\n')
                                .replace(/\\\\/g, '\\');
                        }
                    }

                    // Use normalized matching to check if this is our evolved component
                    if (normalizeComponentName(evolvedNameInLine) === normalizeComponentName(componentNameToMatch)) {
                        return line.replace(/\s([0-9]?\.[0-9]+[0-9]?)+/g, ` ${newMaturity.toFixed(2)}`);
                    }
                }
                return line;
            });

            const newText = updatedLines.join('\n');
            mutateMapText(newText);
            return;
        }

        // Handle regular components - match component statements with proper multi-line name handling
        const updatedLines = lines.map((line, index) => {
            if (index + 1 === component.line) {
                // Check if this line contains a component statement
                if (line.trim().startsWith('component ')) {
                    const componentContent = line.trim().substring(10).trim(); // Remove 'component '

                    // Extract component name from the line
                    let componentNameInLine = '';
                    if (componentContent.startsWith('"')) {
                        // Extract quoted component name
                        const quotedMatch = componentContent.match(/^"((?:[^"\\]|\\.)*)"/);
                        if (quotedMatch) {
                            componentNameInLine = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                        }
                    } else {
                        // Extract unquoted component name (up to first bracket or label)
                        const unquotedMatch = componentContent.match(/^([^\[\]]+?)(?:\s*\[|\s*label|\s*$)/);
                        if (unquotedMatch) {
                            componentNameInLine = unquotedMatch[1].trim();
                        }
                    }

                    // Use normalized matching to check if this is our component
                    if (normalizeComponentName(componentNameInLine) === normalizeComponentName(component.name)) {
                        const newLowerBoundary = clampMaturity(newMaturity + lowerOffset);
                        const newUpperBoundary = clampMaturity(newMaturity + upperOffset);
                        const newUncertaintyStart = Math.min(newLowerBoundary, newUpperBoundary);
                        const newUncertaintyEnd = Math.max(newLowerBoundary, newUpperBoundary);
                        const hasUncertaintyClause = /\buncertainty\s*\[[^\]]*\]/i.test(line);
                        const hasRelativeUncertainty = Math.abs(lowerOffset) > 0.000001 || Math.abs(upperOffset) > 0.000001;
                        const shouldPersistUncertaintyClause = hasUncertaintyClause || hasRelativeUncertainty;

                        if (line.includes('label')) {
                            const parts = line.split(/\blabel\b/);
                            const updatedFirstPart = parts[0].replace(
                                /\[([^[\]]+)\]/,
                                `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`,
                            );
                            const lineWithUpdatedCoords = updatedFirstPart + 'label' + parts[1];
                            return updateUncertaintyClause(
                                lineWithUpdatedCoords,
                                newUncertaintyStart,
                                newUncertaintyEnd,
                                shouldPersistUncertaintyClause,
                            );
                        } else {
                            const lineWithUpdatedCoords = line.replace(/\[([^[\]]+)\]/, `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`);
                            return updateUncertaintyClause(
                                lineWithUpdatedCoords,
                                newUncertaintyStart,
                                newUncertaintyEnd,
                                shouldPersistUncertaintyClause,
                            );
                        }
                    }
                }
            }
            return line;
        });

        const newText = updatedLines.join('\n');
        mutateMapText(newText);
    };

    const handleUncertaintySelection = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        selectComponent(component.id);
        setIsUncertaintySelected(true);
        if (component.line) {
            setHighlightLine(component.line);
        }
    };

    const updateUncertaintyBoundary = (boundary: 'lower' | 'upper', movedPosition: MovedPosition) => {
        if (component.line === undefined || component.evolved) return;

        const calculator = new ModernPositionCalculator();
        const updatedBoundary = clampMaturity(parseFloat(calculator.xToMaturity(movedPosition.x, mapDimensions.width)));

        const lower = boundary === 'lower' ? updatedBoundary : lowerBoundary;
        const upper = boundary === 'upper' ? updatedBoundary : upperBoundary;
        const start = Math.min(lower, upper);
        const end = Math.max(lower, upper);

        const lines = mapText.split('\n');
        const updatedLines = lines.map((line, index) => {
            if (index + 1 !== component.line) {
                return line;
            }

            if (!line.trim().startsWith('component ')) {
                return line;
            }

            return updateUncertaintyClause(line, start, end);
        });

        mutateMapText(updatedLines.join('\n'));
    };

    return (
        <>
            {shouldRenderUncertainty && (
                <g data-testid={`component-uncertainty-${component.id}`}>
                    {!isWardleyStyle && (
                        <>
                            <rect
                                x={uncertaintyX1}
                                y={posY - uncertaintyBandHalfHeight}
                                width={Math.max(0, uncertaintyX2 - uncertaintyX1)}
                                height={uncertaintyBandHeight}
                                fill={`url(#${uncertaintyGradientId})`}
                                stroke={
                                    isUncertaintySelected && isElementSelected
                                        ? componentStrokeColor
                                        : 'none'
                                }
                                strokeWidth={isUncertaintySelected && isElementSelected ? 1.5 : 0}
                                rx={2}
                                pointerEvents="none"
                            />
                        </>
                    )}

                    {isWardleyStyle && (
                        <>
                            <line
                                x1={uncertaintyX1}
                                y1={posY}
                                x2={uncertaintyX2}
                                y2={posY}
                                stroke={componentStrokeColor}
                                strokeWidth={componentStrokeWidth}
                                strokeOpacity={0.75}
                                pointerEvents="none"
                            />
                            <line
                                x1={uncertaintyX1}
                                y1={posY - uncertaintyCapHalfHeight}
                                x2={uncertaintyX1}
                                y2={posY + uncertaintyCapHalfHeight}
                                stroke={componentStrokeColor}
                                strokeWidth={componentStrokeWidth}
                                strokeOpacity={0.75}
                                pointerEvents="none"
                            />
                            <line
                                x1={uncertaintyX2}
                                y1={posY - uncertaintyCapHalfHeight}
                                x2={uncertaintyX2}
                                y2={posY + uncertaintyCapHalfHeight}
                                stroke={componentStrokeColor}
                                strokeWidth={componentStrokeWidth}
                                strokeOpacity={0.75}
                                pointerEvents="none"
                            />
                        </>
                    )}

                    <rect
                        x={uncertaintyX1}
                        y={posY - uncertaintyBandHalfHeight}
                        width={Math.max(8, uncertaintyX2 - uncertaintyX1)}
                        height={uncertaintyBandHeight}
                        fill="transparent"
                        pointerEvents="all"
                        style={{cursor: 'pointer'}}
                        onClick={handleUncertaintySelection}
                    />

                    {isUncertaintySelected && isElementSelected && (
                        <rect
                            x={uncertaintyX1}
                            y={posY - uncertaintyBandHalfHeight}
                            width={Math.max(0, uncertaintyX2 - uncertaintyX1)}
                            height={uncertaintyBandHeight}
                            fill="none"
                            stroke={componentStrokeColor}
                            strokeWidth={2}
                            strokeDasharray="3,2"
                            pointerEvents="none"
                        />
                    )}
                </g>
            )}

            {shouldRenderUncertainty && isUncertaintySelected && isElementSelected && (
                <>
                    <Movable
                        id={`uncertainty-lower-${component.id}`}
                        x={uncertaintyX1}
                        y={posY}
                        onMove={movedPosition => updateUncertaintyBoundary('lower', movedPosition)}
                        fixedY={true}
                        fixedX={false}
                        shouldShowMoving={false}
                        scaleFactor={scaleFactor}>
                        <circle cx={0} cy={0} r={4} fill="#ffffff" stroke={componentStrokeColor} strokeWidth={1.5} />
                    </Movable>
                    <Movable
                        id={`uncertainty-upper-${component.id}`}
                        x={uncertaintyX2}
                        y={posY}
                        onMove={movedPosition => updateUncertaintyBoundary('upper', movedPosition)}
                        fixedY={true}
                        fixedX={false}
                        shouldShowMoving={false}
                        scaleFactor={scaleFactor}>
                        <circle cx={0} cy={0} r={4} fill="#ffffff" stroke={componentStrokeColor} strokeWidth={1.5} />
                    </Movable>
                </>
            )}
            <Movable
                id={`element_${component.id}`}
                x={posX}
                y={posY}
                onMove={updatePosition}
                fixedY={component.evolved}
                fixedX={false}
                shouldShowMoving={true}
                scaleFactor={scaleFactor}>
                <g
                    id={component.id}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        filter: isElementSelected ? 'brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))' : 'none',
                    }}
                    data-testid={`map-component-${component.id}`}>
                    {/* Selection indicator background - rendered first */}
                    {isElementSelected && (
                        <circle
                            cx={0}
                            cy={0}
                            r={12}
                            fill="rgba(33, 150, 243, 0.1)"
                            stroke="#2196F3"
                            strokeWidth={2}
                            strokeOpacity={0.6}
                            strokeDasharray="3,2"
                            style={{
                                animation: 'componentSelectionPulse 2s ease-in-out infinite',
                            }}
                        />
                    )}

                    {/* Hover indicator - rendered second */}
                    <g
                        className="component-hover-indicator"
                        style={{
                            opacity: 0,
                            transition: 'opacity 0.1s ease-in-out',
                            pointerEvents: 'none',
                        }}>
                        <circle cx={0} cy={0} r={12} fill="#87ceeb" stroke="#2196F3" strokeWidth="1" />
                    </g>

                    {/* Component content - rendered last so it appears on top */}
                    {children}
                </g>
            </Movable>

            {component.inertia && !component.evolved && component.evolving === false && (
                <Inertia maturity={component.maturity + 0.02} visibility={component.visibility} mapDimensions={mapDimensions} />
            )}

            <g transform={`translate(${posX},${posY})`}>
                <ComponentText
                    component={component}
                    cx={0}
                    cy={0}
                    styles={mapStyleDefs?.component}
                    element={{
                        id: component.id,
                        name: component.evolved && component.override ? component.override : component.name,
                        type: component.type,
                        line: component.line,
                        evolved: component.evolved,
                        evolving: component.evolving,
                        override: component.override,
                        maturity: component.maturity,
                        label: component.label,
                    }}
                    mapStyleDefs={mapStyleDefs}
                    scaleFactor={scaleFactor}
                    mapText={mapText}
                    mutateMapText={mutateMapText}
                    onClick={() => {
                        selectComponent(component.id);
                        if (component.line) {
                            setHighlightLine(component.line);
                        }
                    }}
                />
            </g>

            {/* CSS animations for component selection */}
            <defs>
                {!isWardleyStyle && (
                    <linearGradient id={uncertaintyGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={componentStrokeColor} stopOpacity={mapStyleDefs?.className === 'dark' ? 0.06 : 0.12} />
                        <stop
                            offset={uncertaintyPeakOffset}
                            stopColor={componentStrokeColor}
                            stopOpacity={mapStyleDefs?.className === 'colour' ? 0.35 : 0.26}
                        />
                        <stop offset="100%" stopColor={componentStrokeColor} stopOpacity={mapStyleDefs?.className === 'dark' ? 0.06 : 0.12} />
                    </linearGradient>
                )}
                <style>
                    {`
                    @keyframes componentSelectionPulse {
                      0%, 100% {
                        stroke-opacity: 0.4;
                        r: 12;
                      }
                      50% {
                        stroke-opacity: 0.8;
                        r: 14;
                      }
                    }
                    
                    @keyframes fadeIn {
                      from {
                        opacity: 0;
                      }
                      to {
                        opacity: 0.8;
                      }
                    }
                    
                    g[data-testid^="map-component-"]:hover .component-hover-indicator {
                      opacity: 0.8 !important;
                      animation: fadeIn 0.2s ease-in-out;
                    }
                    `}
                </style>
            </defs>
        </>
    );
};

export default MapComponent;
