// Phase 4: Component Interface Modernization
// Modern MapView component that accepts UnifiedWardleyMap directly
// This replaces the legacy MapView component with a cleaner, unified interface

import React, { LegacyRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    EvolutionStages,
    MapCanvasDimensions,
    MapDimensions,
    Offsets,
} from '../../constants/defaults';

import { MapAnnotationsPosition } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import { UnifiedWardleyMap } from '../../types/unified/map';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import CanvasSpeedDial from './CanvasSpeedDial';
import UnifiedMapCanvas from './UnifiedMapCanvas';
import { DefaultThemes } from './foundation/Fill';

export interface ModernMapViewProps {
    // Core unified data
    wardleyMap: UnifiedWardleyMap;

    // UI state and configuration
    shouldHideNav: () => void;
    hideNav: boolean;
    mapTitle: string;
    mapAnnotationsPresentation: MapAnnotationsPosition;
    mapStyleDefs: MapTheme;
    mapCanvasDimensions: MapCanvasDimensions;
    mapDimensions: MapDimensions;
    mapEvolutionStates: EvolutionStages;
    mapRef: React.MutableRefObject<HTMLElement | null>;

    // Text and mutations
    mapText: string;
    mutateMapText: (newText: string) => void;
    evolutionOffsets: Offsets;

    // Interaction handlers
    launchUrl: (urlId: string) => void;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<
        React.SetStateAction<{ x: string; y: string } | null>
    >;
    showLinkedEvolved: boolean;
}

export const MapView: React.FunctionComponent<ModernMapViewProps> = (props) => {
    const featureSwitches = useFeatureSwitches();
    const [quickAddTemplate, setQuickAddTemplate] = useState(
        () => () => console.log('nullTemplate'),
    );
    const [quickAddInProgress, setQuickAddInProgress] = useState(false);

    const fill: DefaultThemes = {
        wardley: 'url(#wardleyGradient)',
        colour: 'none',
        plain: 'none',
        handwritten: 'none',
        dark: '#353347',
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor:
            fill[props.mapStyleDefs.className as keyof DefaultThemes],
        position: 'relative',
        width: '100%',
        height: '100%', // Changed from 100vh to 100% to respect parent container
        overflow: 'hidden', // Prevent scrollbars
    };

    const mapStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        overflow: 'hidden', // Prevent scrollbars on the map container
        position: 'relative', // Add relative positioning for toolbar placement
    };

    const legacyRef: LegacyRef<HTMLDivElement> | undefined = props.mapRef as
        | LegacyRef<HTMLDivElement>
        | undefined;

    function svgToBase64Url(svgString: string, width: number, height: number) {
        console.log(svgString);
        const base64SVG = btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}px" height="${height}px">${svgString}</svg>`,
        );
        return `url('data:image/svg+xml;base64,${base64SVG}')`;
    }

    const setQuickAdd = (quickAdd: any) => {
        setQuickAddInProgress(true);
        svgToBase64Url(ReactDOMServer.renderToString(quickAdd.cursor), 15, 15);
        setQuickAddTemplate(() => () => quickAdd.template);
    };

    // We ignore the position parameter since we don't need it
    const handleMapCanvasClick = () => {
        if (featureSwitches.enableQuickAdd == false) return;
        if (quickAddInProgress) {
            // When in quick add mode, execute the template
            quickAddTemplate();
            setQuickAddInProgress(false);
        }
        // Note: The actual coordinate handling for double-click is now in UnifiedMapCanvas
    };

    return (
        <div
            ref={legacyRef}
            className={props.mapStyleDefs.className}
            style={containerStyle}
        >
            {featureSwitches.enableQuickAdd && (
                <CanvasSpeedDial
                    setQuickAdd={setQuickAdd}
                    mapStyleDefs={props.mapStyleDefs}
                />
            )}
            <div id="map" style={mapStyle}>
                <UnifiedMapCanvas
                    wardleyMap={props.wardleyMap}
                    mapDimensions={props.mapDimensions}
                    mapCanvasDimensions={props.mapCanvasDimensions}
                    mapStyleDefs={props.mapStyleDefs}
                    mapEvolutionStates={props.mapEvolutionStates}
                    evolutionOffsets={props.evolutionOffsets}
                    mapText={props.mapText}
                    mutateMapText={props.mutateMapText}
                    setHighlightLine={props.setHighlightLine}
                    setNewComponentContext={props.setNewComponentContext}
                    launchUrl={props.launchUrl}
                    showLinkedEvolved={props.showLinkedEvolved}
                    shouldHideNav={props.shouldHideNav}
                    hideNav={props.hideNav}
                    mapAnnotationsPresentation={
                        props.mapAnnotationsPresentation
                    }
                    handleMapCanvasClick={handleMapCanvasClick}
                />
            </div>
        </div>
    );
};
