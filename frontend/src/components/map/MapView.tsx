import React, { LegacyRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    EvolutionStages,
    MapCanvasDimensions,
    MapDimensions,
    Offsets,
} from '../../constants/defaults';

import {
    MapAccelerators,
    MapAnchors,
    MapAnnotations,
    MapAnnotationsPosition,
    MapAttitudes,
    MapComponents,
    MapEcosystems,
    MapEvolved,
    MapLinks,
    MapMarkets,
    MapMethods,
    MapNotes,
    MapPipelines,
    MapSubmaps,
} from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import CanvasSpeedDial from './CanvasSpeedDial';
import UnifiedMapCanvas from './UnifiedMapCanvas';
import { DefaultThemes } from './foundation/Fill';

export interface MapViewProps {
    shouldHideNav: () => void;
    hideNav: boolean;
    mapTitle: string;
    mapComponents: MapComponents[];
    mapMarkets: MapMarkets[];
    mapEcosystems: MapEcosystems[];
    mapSubMaps: MapSubmaps[];
    mapEvolved: MapEvolved[];
    mapPipelines: MapPipelines[];
    mapAnchors: MapAnchors[];
    mapLinks: MapLinks[];
    mapAttitudes: MapAttitudes[];
    mapAccelerators: MapAccelerators[];
    launchUrl: (urlId: string) => void;
    mapNotes: MapNotes[];
    mapAnnotations: MapAnnotations[];
    mapAnnotationsPresentation: MapAnnotationsPosition;
    mapMethods: MapMethods[];
    mapStyleDefs: MapTheme;
    mapCanvasDimensions: MapCanvasDimensions;
    mapDimensions: MapDimensions;
    mapEvolutionStates: EvolutionStages;
    mapRef: React.MutableRefObject<HTMLElement | null>;
    mapText: string;
    mutateMapText: (newText: string) => void;
    evolutionOffsets: Offsets;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<null>>;
    showLinkedEvolved: boolean;
}

export const MapView: React.FunctionComponent<MapViewProps> = (props) => {
    const featureSwitches = useFeatureSwitches();
    // const [quickAddCursor, setQuickAddCursor] = useState('default');
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

    // const textColour: DefaultThemes = {
    //     wardley: 'black',
    //     colour: 'black',
    //     plain: 'black',
    //     handwritten: 'black',
    //     dark: 'white',
    // };

    const containerStyle: React.CSSProperties = {
        backgroundColor:
            fill[props.mapStyleDefs.className as keyof DefaultThemes],
        position: 'relative',
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
        const i = svgToBase64Url(
            ReactDOMServer.renderToString(quickAdd.cursor),
            15,
            15,
        );
        console.log('MapView::setQuickAdd::icon', i);
        // setQuickAddCursor(i + ' 8 8, auto');
        setQuickAddTemplate(() => () => quickAdd.template);
    };

    const handleMapCanvasClick = (pos: any) => {
        if (featureSwitches.enableQuickAdd == false) return;
        console.log('MapView::handleMapCanvasClick', pos);
        if (quickAddInProgress) {
            console.log(
                'MapView::handleMapCanvasClick::quickAddTemplate',
                quickAddTemplate,
            );
            // const componentString = quickAddTemplate()('text', pos.y, pos.x);
            // props.mutateMapText(props.mapText + `\r\n${componentString}`);
            setQuickAddInProgress(false);
            // setQuickAddCursor('default');
        }
    };

    return (
        <div
            ref={legacyRef}
            className={props.mapStyleDefs.className}
            style={containerStyle}
        >
            {featureSwitches.enableQuickAdd && (
                <CanvasSpeedDial setQuickAdd={setQuickAdd} {...props} />
            )}
            <div id="map">
                <UnifiedMapCanvas
                    handleMapCanvasClick={handleMapCanvasClick}
                    {...props}
                />
            </div>
        </div>
    );
};
