import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton, Typography } from '@mui/material';
import React, { LegacyRef } from 'react';
import {
    EvolutionStages,
    MapDimensions,
    Offsets,
} from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import {
    MapAccelerators,
    MapAnchors,
    MapAnnotations,
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
} from '../../conversion/Converter';
import { MapAnnotationsPosition } from '../../conversion/PresentationExtractionStrategy';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import MapCanvas from './MapCanvas';
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
    mapAnnotations: MapAnnotations;
    mapAnnotationsPresentation: MapAnnotationsPosition;
    mapMethods: MapMethods[];
    mapStyleDefs: MapTheme;
    mapDimensions: MapDimensions;
    mapEvolutionStates: EvolutionStages;
    mapRef: React.MutableRefObject<HTMLElement | null>;
    mapText: string;
    mutateMapText: (newText: string) => void;
    setMetaText: React.Dispatch<React.SetStateAction<string>>;
    metaText: string;
    evolutionOffsets: Offsets;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<null>>;
    showLinkedEvolved: boolean;
}

export const MapView: React.FunctionComponent<MapViewProps> = props => {
    const featureSwitches = useFeatureSwitches();
    const fill: DefaultThemes = {
        wardley: 'url(#wardleyGradient)',
        colour: 'none',
        plain: 'none',
        handwritten: 'none',
        dark: '#353347',
    };

    const textColour: DefaultThemes = {
        wardley: 'black',
        colour: 'black',
        plain: 'black',
        handwritten: 'black',
        dark: 'white',
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor:
            fill[props.mapStyleDefs.className as keyof DefaultThemes],
        position: 'relative',
    };

    const textStyle: React.CSSProperties = {
        textAlign: 'center',
        color: textColour[props.mapStyleDefs.className as keyof DefaultThemes],
    };

    const legacyRef: LegacyRef<HTMLDivElement> | undefined = props.mapRef as
        | LegacyRef<HTMLDivElement>
        | undefined;

    return (
        <div
            ref={legacyRef}
            className={props.mapStyleDefs.className}
            style={containerStyle}
        >
            <Typography padding={'5px'} sx={textStyle} variant="h5" id="title">
                {props.mapTitle}
            </Typography>
            <div id="map">
                <MapCanvas mapPadding={20} {...props} />
            </div>
            {featureSwitches.showToggleFullscreen && (
                <IconButton
                    onClick={props.shouldHideNav}
                    color={'default'}
                    aria-label={
                        props.hideNav ? 'Exit Fullscreen' : 'Fullscreen'
                    }
                    sx={{ position: 'absolute', right: '10px', top: '0' }}
                >
                    {props.hideNav ? (
                        <FullscreenExitIcon sx={{ color: textStyle.color }} />
                    ) : (
                        <FullscreenIcon sx={{ color: textStyle.color }} />
                    )}
                </IconButton>
            )}
        </div>
    );
};
