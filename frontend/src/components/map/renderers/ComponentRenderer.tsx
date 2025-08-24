import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../../constants/defaults';
import {MapElements} from '../../../processing/MapElements';
import {MapTheme} from '../../../types/map/styles';
import {UnifiedComponent} from '../../../types/unified';
import {getMapElementsDecorated} from '../../../utils/mapProcessing';
import AcceleratorSymbol from '../../symbols/AcceleratorSymbol';
import ComponentSymbol from '../../symbols/ComponentSymbol';
import EcosystemSymbol from '../../symbols/EcosystemSymbol';
import MarketSymbol from '../../symbols/MarketSymbol';
import PipelineComponentSymbol from '../../symbols/PipelineComponentSymbol';
import SubMapSymbol from '../../symbols/SubMapSymbol';
import Anchor from '../Anchor';
import MapAccelerator from '../MapAccelerator';
import MapComponent from '../MapComponent';
import MethodElement from '../MethodElement';
import ModernPositionCalculator from '../ModernPositionCalculator';

interface ComponentRendererProps {
    mapElements: MapElements;
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;
    
    // Event handlers
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: {el: any; e: MouseEvent<Element> | null}) => void;
    launchUrl?: (url: string) => void;
    
    // Feature flags
    enableAccelerators: boolean;
    
    // Component data
    mapAccelerators: UnifiedComponent[];
    
    // Method application props
    methodHighlightedComponent?: UnifiedComponent | null;
    selectedToolbarItem?: any;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
    mapElements,
    mapDimensions,
    mapStyleDefs,
    mapText,
    mutateMapText,
    scaleFactor,
    setHighlightLine,
    clicked,
    launchUrl,
    enableAccelerators,
    mapAccelerators,
    methodHighlightedComponent,
    selectedToolbarItem,
}) => {
    const setHighlightLineDispatch = (value: any) => {
        if (typeof value === 'function') {
            setHighlightLine(value(0));
        } else {
            setHighlightLine(value);
        }
    };

    const mapAnchors: UnifiedComponent[] = mapElements.getAllComponents().filter(c => c.type === 'anchor');

    const passComponent = (component: UnifiedComponent): UnifiedComponent => {
        return component;
    };

    // Calculate highlight circle radius based on component type/decorators
    const getHighlightRadius = (component: UnifiedComponent): number => {
        if (component.decorators?.ecosystem) {
            return 35; // Ecosystem symbol has r="30", so highlight should be slightly larger
        }
        if (component.decorators?.market) {
            return 25; // Market symbol is medium-sized, needs larger highlight
        }
        if (component.decorators?.buy || component.decorators?.build || component.decorators?.outsource) {
            return 20; // Method symbols have r="15", so highlight should be larger to be visible
        }
        return 15; // Default size for regular components
    };

    return (
        <g id="component-content">
            {/* CSS animations for method application highlighting */}
            <defs>
                <style>
                    {`
                        @keyframes methodHighlightPulse {
                            0%, 100% {
                                stroke-opacity: 0.3;
                                stroke-width: 2;
                            }
                            50% {
                                stroke-opacity: 0.8;
                                stroke-width: 3;
                            }
                        }

                        .method-hover-circle {
                            animation: methodHighlightPulse 1.5s ease-in-out infinite;
                        }

                        .method-hover-circle:hover {
                            stroke: #4CAF50 !important;
                            stroke-width: 3 !important;
                            stroke-opacity: 0.8 !important;
                            stroke-dasharray: 0 !important;
                            animation: none !important;
                        }
                    `}
                </style>
            </defs>

            <g id="anchors">
                {mapAnchors.map((a: UnifiedComponent, i: number) => (
                    <Anchor
                        key={i}
                        mapDimensions={mapDimensions}
                        anchor={a}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        onClick={() => setHighlightLine(a.line || 0)}
                        scaleFactor={scaleFactor}
                    />
                ))}
            </g>

            <g id="accelerators">
                {enableAccelerators &&
                    mapAccelerators &&
                    mapAccelerators.map((el: UnifiedComponent, i: number) => (
                        <MapAccelerator
                            key={i}
                            element={el}
                            mapDimensions={mapDimensions}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            scaleFactor={scaleFactor}>
                            <AcceleratorSymbol
                                id={'accelerator_circle_' + el.id}
                                component={el}
                                onClick={() =>
                                    clicked({
                                        el: passComponent(el),
                                        e: null,
                                    })
                                }
                            />
                        </MapAccelerator>
                    ))}
            </g>

            <g id="methods">
                {getMapElementsDecorated(mapElements).map((methodComp: UnifiedComponent, i: number) => {
                    return (
                        <MethodElement
                            key={`method_${i}`}
                            methodComponent={methodComp}
                            mapDimensions={mapDimensions}
                            mapStyleDefs={mapStyleDefs}
                            setHighlightLine={setHighlightLineDispatch}
                        />
                    );
                })}
            </g>

            <g id="elements">
                {mapElements
                    .getMergedComponents()
                    .filter((c: UnifiedComponent) => c.type !== 'anchor')
                    .map((el: UnifiedComponent, i: number) => {
                        // Check if this component should be highlighted for method application
                        const isMethodHighlighted = methodHighlightedComponent?.id === el.id;
                        const isMethodCompatible = el.type === 'component' && !el.pipeline;
                        const isInMethodApplicationMode =
                            selectedToolbarItem?.toolType === 'method-application' || selectedToolbarItem?.id === 'component';

                        // Calculate the same position that MapComponent uses for the Movable wrapper
                        const calculatedPosition = new ModernPositionCalculator();
                        const posX = calculatedPosition.maturityToX(el.maturity, mapDimensions.width);
                        const posY = calculatedPosition.visibilityToY(el.visibility, mapDimensions.height) + (el.offsetY ? el.offsetY : 0);

                        const highlightRadius = getHighlightRadius(el);

                        return (
                            <React.Fragment key={i}>
                                {/* Method application highlighting - positioned at the same coordinates as the Movable component */}
                                {isInMethodApplicationMode && isMethodCompatible && (
                                    <circle
                                        cx={posX}
                                        cy={posY}
                                        r={highlightRadius}
                                        fill="none"
                                        stroke="#2196F3"
                                        strokeWidth="2"
                                        strokeOpacity="0.5"
                                        strokeDasharray="5,5"
                                        pointerEvents="all"
                                        className="method-hover-circle"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    />
                                )}

                                <MapComponent
                                    launchUrl={launchUrl}
                                    mapDimensions={mapDimensions}
                                    component={passComponent(el)}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mapStyleDefs}
                                    setHighlightLine={setHighlightLineDispatch}
                                    scaleFactor={scaleFactor}>
                                    {el.type === 'component' && !el.pipeline && (
                                        <ComponentSymbol
                                            id={`element_circle_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                        />
                                    )}

                                    {el.pipeline && (
                                        <PipelineComponentSymbol
                                            id={`element_square_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={e =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e: e,
                                                })
                                            }
                                        />
                                    )}

                                    {(el.decorators?.ecosystem || el.type === 'ecosystem') && (
                                        <EcosystemSymbol
                                            id={`ecosystem_circle_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                        />
                                    )}

                                    {(el.decorators?.market || el.type === 'market') && (
                                        <MarketSymbol
                                            id={`market_circle_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                        />
                                    )}

                                    {el.type === 'submap' && (
                                        <SubMapSymbol
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                            launchUrl={
                                                el.url && typeof el.url === 'object' && 'url' in el.url && (el.url as any).url
                                                    ? () => launchUrl?.((el.url as any).url)
                                                    : undefined
                                            }
                                        />
                                    )}
                                </MapComponent>
                            </React.Fragment>
                        );
                    })}
            </g>
        </g>
    );
};