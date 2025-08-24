import React from 'react';
import {MapDimensions} from '../../../constants/defaults';
import {MapElements} from '../../../processing/MapElements';
import {MapTheme} from '../../../types/map/styles';
import {UnifiedComponent} from '../../../types/unified';
import ComponentLink from '../ComponentLink';
import EvolvingComponentLink from '../EvolvingComponentLink';
import FluidLink from '../FluidLink';
import LinkingPreview from '../LinkingPreview';

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

    // Link interaction handlers
    onLinkClick?: (linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => void;
    onLinkContextMenu?: (
        linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        event: React.MouseEvent,
    ) => void;
    isLinkSelected?: (linkId: string) => boolean;

    // Linking functionality props
    linkingState?: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent?: UnifiedComponent | null;
    mousePosition?: {x: number; y: number};
    highlightedComponent?: UnifiedComponent | null;
    isDuplicateLink?: boolean;
    isInvalidTarget?: boolean;
    showCancellationHint?: boolean;
    isSourceDeleted?: boolean;
    isTargetDeleted?: boolean;
}

export const LinkRenderer: React.FC<LinkRendererProps> = ({
    mapDimensions,
    mapStyleDefs,
    scaleFactor,
    mapElements,
    links,
    mapElementsClicked,
    evolutionOffsets,
    onLinkClick,
    onLinkContextMenu,
    isLinkSelected,
    linkingState,
    sourceComponent,
    mousePosition,
    highlightedComponent,
    isDuplicateLink,
    isInvalidTarget,
    showCancellationHint,
    isSourceDeleted,
    isTargetDeleted,
}) => {
    const getElementByName = (elements: UnifiedComponent[], name: string) => elements.find(e => e.name === name);

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
                                onLinkClick={onLinkClick}
                                onLinkContextMenu={onLinkContextMenu}
                                isLinkSelected={isLinkSelected}
                            />
                        ))}
                    </g>
                ))}
            </g>

            <g id="evolvedLinks">
                {mapElements.getEvolvingComponents().map((e: UnifiedComponent, i: number) => {
                    const startElement = getElementByName(mapElements.getEvolvingComponents(), e.name);
                    const endElement = getElementByName(mapElements.getEvolvedComponents(), e.name);

                    if (!startElement || !endElement) {
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

            {/* Linking preview for component linking functionality */}
            <LinkingPreview
                linkingState={linkingState || 'idle'}
                sourceComponent={sourceComponent || null}
                mousePosition={mousePosition || {x: 0, y: 0}}
                highlightedComponent={highlightedComponent || null}
                mapStyleDefs={mapStyleDefs}
                mapDimensions={mapDimensions}
                isDuplicateLink={isDuplicateLink || false}
                isInvalidTarget={isInvalidTarget || false}
                showCancellationHint={showCancellationHint || false}
                isSourceDeleted={isSourceDeleted || false}
                isTargetDeleted={isTargetDeleted || false}
            />
        </g>
    );
};
