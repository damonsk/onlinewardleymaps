import React from 'react';
import {MapDimensions} from '../../../constants/defaults';
import {MapElements} from '../../../processing/MapElements';
import {MapTheme} from '../../../types/map/styles';
import {UnifiedComponent} from '../../../types/unified';
import ComponentLink from '../ComponentLink';
import EvolvingComponentLink from '../EvolvingComponentLink';
import FluidLink from '../FluidLink';

interface LinkRendererProps {
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    scaleFactor: number;
    mapElements: MapElements;

    // Link data
    links: any[];
    mapElementsClicked: Array<{
        el: UnifiedComponent;
        e: React.MouseEvent<Element>;
    }>;
    evolutionOffsets: {
        commodity: number;
        product: number;
        custom: number;
    };

    // Map text for link context editing
    mapText?: string;
    mutateMapText?: (newText: string) => void;

    // Link interaction handlers
    onLinkClick?: (linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => void;
    onLinkContextMenu?: (
        linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        event: React.MouseEvent,
    ) => void;
    isLinkSelected?: (linkId: string) => boolean;

}

export const LinkRenderer: React.FC<LinkRendererProps> = React.memo(({
    mapDimensions,
    mapStyleDefs,
    scaleFactor,
    mapElements,
    links,
    mapElementsClicked,
    evolutionOffsets,
    mapText,
    mutateMapText,
    onLinkClick,
    onLinkContextMenu,
    isLinkSelected,
}) => {
    const evolvingComponents = React.useMemo(() => mapElements.getEvolvingComponents(), [mapElements]);
    const evolvedComponentsByName = React.useMemo(() => {
        return new Map(mapElements.getEvolvedComponents().map(component => [component.name, component]));
    }, [mapElements]);

    const passComponent = (component: UnifiedComponent): UnifiedComponent => {
        return component;
    };

    return (
        <g id="link-content">
            <g id="links">
                {links.map((current: any) => (
                    <g id={current.name} key={current.name}>
                        {current.links.map((l: any, i: number) => (
                            <ComponentLink
                                mapStyleDefs={mapStyleDefs}
                                key={i}
                                mapDimensions={mapDimensions}
                                startElement={l.startElement}
                                endElement={l.endElement}
                                link={l.link}
                                scaleFactor={scaleFactor}
                                mapText={mapText}
                                mutateMapText={mutateMapText}
                                onLinkClick={onLinkClick}
                                onLinkContextMenu={onLinkContextMenu}
                                isLinkSelected={isLinkSelected}
                            />
                        ))}
                    </g>
                ))}
            </g>

            <g id="evolvedLinks">
                {evolvingComponents.map((startElement: UnifiedComponent, i: number) => {
                    const endElement = evolvedComponentsByName.get(startElement.name);

                    if (!endElement) {
                        return null;
                    }

                    return (
                        <EvolvingComponentLink
                            key={i}
                            mapStyleDefs={mapStyleDefs}
                            mapDimensions={mapDimensions}
                            endElement={passComponent(endElement)}
                            startElement={passComponent(startElement)}
                            evolutionOffsets={evolutionOffsets}
                        />
                    );
                })}
            </g>

            <g id="fluidLinks">
                {mapElementsClicked &&
                    mapElementsClicked.map((current: any, i: number) => (
                        <FluidLink
                            key={`fluid-${i}`}
                            mapStyleDefs={mapStyleDefs}
                            mapDimensions={mapDimensions}
                            startElement={passComponent(current.el)}
                            origClick={current.e}
                            scaleFactor={scaleFactor}
                        />
                    ))}
            </g>

        </g>
    );
});

LinkRenderer.displayName = 'LinkRenderer';
