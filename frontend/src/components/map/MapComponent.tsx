import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {normalizeComponentName} from '../../utils/componentNameMatching';
import {useComponentSelection} from '../ComponentSelectionContext';
import ComponentText from './ComponentText';
import {useContextMenu} from './ContextMenuProvider';
import {useComponentLinkHighlight} from '../contexts/ComponentLinkHighlightContext';
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

    // Check if this component is currently selected
    const isElementSelected = isSelected(component.id);

    const handleClick = (e: React.MouseEvent) => {
        console.log('MapComponent clicked, selecting component:', component.id);
        e.preventDefault();
        e.stopPropagation();

        // Select this component
        selectComponent(component.id);

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
                        if (line.includes('label')) {
                            const parts = line.split(/\blabel\b/);
                            const updatedFirstPart = parts[0].replace(
                                /\[([^[\]]+)\]/,
                                `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`,
                            );
                            return updatedFirstPart + 'label' + parts[1];
                        } else {
                            return line.replace(/\[([^[\]]+)\]/, `[${newVisibility.toFixed(2)}, ${newMaturity.toFixed(2)}]`);
                        }
                    }
                }
            }
            return line;
        });

        const newText = updatedLines.join('\n');
        mutateMapText(newText);
    };

    return (
        <>
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
                    id={`component_text_${component.id}`}
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
