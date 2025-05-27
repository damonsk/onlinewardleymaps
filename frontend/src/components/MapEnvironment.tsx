import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
} from '@mui/material';
import html2canvas from 'html2canvas';
import Router from 'next/router';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import * as Defaults from '../constants/defaults';
import * as MapStyles from '../constants/mapstyles';
import Converter from '../conversion/Converter';
import { LoadMap } from '../repository/LoadMap';
import { MapIteration, OwnApiWardleyMap } from '../repository/OwnApiWardleyMap';
import { SaveMap } from '../repository/SaveMap';
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
    MapSize,
    MapSubmaps,
    MapUrls,
} from '../types/base';
import { MapTheme } from '../types/map/styles';
import { useFeatureSwitches } from './FeatureSwitchesContext';
import { ModKeyPressedProvider } from './KeyPressContext';
import QuickAdd from './actions/QuickAdd';
import { Breadcrumb } from './editor/Breadcrumb';
import Editor from './editor/Editor';
import { NewMapIterations } from './editor/MapIterations';
import { MapView } from './map/MapView';
import { LeftNavigation } from './page/LeftNavigation';
import NewHeader from './page/NewHeader';
import { UsageInfo } from './page/UseageInfo';

function debounce<T extends (...args: any[]) => void>(
    fn: T,
    ms: number,
): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null;

    return function (this: any, ...args: Parameters<T>): void {
        clearTimeout(timer!);
        timer = setTimeout(() => {
            timer = null;
            fn.apply(this, args);
        }, ms);
    };
}

const getHeight = () => {
    const winHeight = window.innerHeight;
    const topNavHeight =
        document.getElementById('top-nav-wrapper')?.clientHeight;
    const titleHeight = document.getElementById('title')?.clientHeight;
    return winHeight - (topNavHeight || 0) - (titleHeight || 0) - 95;
};
const getWidth = () => {
    const clientWidth = document.getElementById('map')?.clientWidth;
    return (clientWidth || 0) - 50;
};

interface MapEnvironmentProps {
    toggleMenu: () => void;
    toggleTheme: () => void;
    menuVisible: boolean;
    isLightTheme: boolean;
    mapPersistenceStrategy: string;
    setMapPersistenceStrategy: React.Dispatch<React.SetStateAction<string>>;
    shouldLoad: boolean;
    setShouldLoad: React.Dispatch<React.SetStateAction<boolean>>;
    currentId: string;
    setCurrentId: React.Dispatch<React.SetStateAction<string>>;
}

const MapEnvironment: FunctionComponent<MapEnvironmentProps> = ({
    toggleMenu,
    menuVisible,
    toggleTheme,
    isLightTheme,
    mapPersistenceStrategy,
    setMapPersistenceStrategy,
    shouldLoad,
    currentId,
    setCurrentId,
    setShouldLoad,
}) => {
    const featureSwitches = useFeatureSwitches();
    const mapRef = useRef<HTMLElement | null>(null);
    const [currentUrl, setCurrentUrl] = useState('');
    const [showUsage, setShowUsage] = useState(false);
    const [mapText, setMapText] = useState('');
    const [mapTitle, setMapTitle] = useState('Untitled Map');
    const [rawMapTitle, setRawMapTitle] = useState('Untitled Map');
    const [mapComponents, setMapComponents] = useState<MapComponents[]>([]);
    const [mapSubMaps, setMapSubMaps] = useState<MapSubmaps[]>([]);
    const [mapMarkets, setMarkets] = useState<MapMarkets[]>([]);
    const [mapEcosystems, setEcosystems] = useState<MapEcosystems[]>([]);
    const [mapEvolved, setMapEvolved] = useState<MapEvolved[]>([]);
    const [mapPipelines, setMapPipelines] = useState<MapPipelines[]>([]);
    const [mapAnchors, setMapAnchors] = useState<MapAnchors[]>([]);
    const [mapNotes, setMapNotes] = useState<MapNotes[]>([]);
    const [mapUrls, setMapUrls] = useState<MapUrls[]>([]);
    const [mapLinks, setMapLinks] = useState<MapLinks[]>([]);
    const [mapAttitudes, setMapAttitudes] = useState<MapAttitudes[]>([]);
    const [mapAnnotations, setMapAnnotations] = useState<MapAnnotations[]>([]);
    const [mapAccelerators, setMapAccelerators] = useState<MapAccelerators[]>(
        [],
    );
    const [mapMethods, setMapMethods] = useState<MapMethods[]>([]);
    const [invalid, setInvalid] = useState(false);
    const [newComponentContext, setNewComponentContext] = useState(null);
    const [mapAnnotationsPresentation, setMapAnnotationsPresentation] =
        useState<MapAnnotationsPosition>({ maturity: 0, visibility: 0 });
    const [mapIterations, setMapIterations] = useState<MapIteration[]>([]);
    const [mapCanvasDimensions, setMapCanvasDimensions] = useState(
        Defaults.MapDimensions,
    );
    const [mapDimensions, setMapDimensions] = useState(Defaults.MapDimensions);
    const [mapEvolutionStates, setMapEvolutionStates] =
        useState<Defaults.EvolutionStages>(Defaults.EvolutionStages);
    const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
    const [mapStyle, setMapStyle] = useState('plain');
    const [mapStyleDefs, setMapStyleDefs] = useState<MapTheme>(MapStyles.Plain);
    const [saveOutstanding, setSaveOutstanding] = useState(false);
    const [highlightLine, setHighlightLine] = useState(0);

    const [errorLine, setErrorLine] = useState<number[]>([]);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [showLinkedEvolved, setShowLinkedEvolved] = useState(false);
    const [mapOnlyView, setMapOnlyView] = useState(false);
    const [currentIteration, setCurrentIteration] = useState(-1);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [hideNav, setHideNav] = useState(false);

    const mutateMapText = (newText: string) => {
        setMapText(newText);
        setSaveOutstanding(true);
        if (currentIteration !== null && currentIteration > -1) {
            const newList = [...mapIterations];
            const item = newList[currentIteration];
            item.mapText = newText;
            newList.splice(currentIteration, 1);
            newList.splice(currentIteration, 0, item);
            setMapIterations(newList);
        }
    };

    const launchUrl = (urlId: string) => {
        const mapUrl = mapUrls.find((u) => u.name === urlId);
        if (mapUrl) {
            window.open(mapUrl.url);
        }
    };

    const toggleUsage = () => {
        setShowUsage(!showUsage);
    };

    const saveToRemoteStorage = async function (hash: string) {
        setActionInProgress(true);
        const mapToPersist: OwnApiWardleyMap = {
            mapText,
            imageData: '',
            mapIterations,
            readOnly: false,
        };

        const followOnActions = async function (id: string) {
            if (currentId === '') {
                console.log('[followOnActions::switch]', {
                    mapPersistenceStrategy,
                    currentId,
                    id,
                });
                switch (mapPersistenceStrategy) {
                    case Defaults.MapPersistenceStrategy.Legacy:
                        window.location.hash = '#' + id;
                        break;
                }
            }

            setCurrentId(id);
            setActionInProgress(false);
            setCurrentUrl(window.location.href);
            setSaveOutstanding(false);

            console.log('saveToPrivateDataStore', {
                mapPersistenceStrategy,
            });
        };

        await SaveMap(
            mapPersistenceStrategy,
            mapToPersist,
            hash,
            followOnActions,
        );
    };

    const loadFromRemoteStorage = async function () {
        const followOnActions = (
            mapPersistenceStrategy: string,
            map: OwnApiWardleyMap,
        ) => {
            setMapPersistenceStrategy(mapPersistenceStrategy);
            setShouldLoad(false);
            setMapText(map.mapText);
            if (map.mapIterations && map.mapIterations.length > 0) {
                setMapIterations(map.mapIterations);
                setCurrentIteration(0);
                setMapText(map.mapIterations[0].mapText);
            }
            setCurrentUrl(window.location.href);

            if (window.location.hash.indexOf('#clone:') === 0) {
                setCurrentUrl('(unsaved)');
                setSaveOutstanding(true);
                setCurrentId('');
                window.location.hash = '';
            }

            setSaveOutstanding(false);
            setActionInProgress(false);

            switch (mapPersistenceStrategy) {
                case Defaults.MapPersistenceStrategy.Legacy:
                    break;
                default:
                    setMapPersistenceStrategy(mapPersistenceStrategy);
                    break;
            }
        };

        setActionInProgress(true);
        setCurrentUrl('(loading...)');
        console.log('--- Set Load Strategy: ', mapPersistenceStrategy);
        await LoadMap(mapPersistenceStrategy, followOnActions, currentId);
    };

    function newMap(mapPersistenceStrategy: string) {
        setMapText('');
        setCurrentId('');
        setCurrentUrl('(unsaved)');
        setSaveOutstanding(false);
        setCurrentIteration(-1);
        setMapIterations([]);
        setMapPersistenceStrategy(mapPersistenceStrategy);
        Router.push({ pathname: '/' }, undefined, { shallow: true });
    }

    async function saveMap() {
        setCurrentUrl('(saving...)');
        saveToRemoteStorage(currentId);
    }

    function downloadMap() {
        if (mapRef.current === null) return;
        const svgMapText =
            mapRef.current.getElementsByTagName('svg')[0].outerHTML;
        const tempElement = document.createElement('div');
        tempElement.innerHTML = svgMapText;
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        document.body.appendChild(tempElement);
        html2canvas(tempElement, { useCORS: true, allowTaint: true })
            .then((canvas) => {
                const base64image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = mapTitle;
                link.href = base64image;
                link.click();
                tempElement.remove();
            })
            // eslint-disable-next-line
            .catch((_) => {
                tempElement.remove();
            });
    }

    function downloadMapAsSVG() {
        if (mapRef.current === null) return;
        const svgMapText = mapRef.current
            .getElementsByTagName('svg')[0]
            .outerHTML.replace(/&nbsp;/g, ' ')
            .replace(
                /<svg([^>]*)>/,
                '<svg xmlns="http://www.w3.org/2000/svg"$1>',
            );
        saveMapText(
            `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svgMapText}`,
            `${mapTitle}.svg`,
        );
    }

    const addIteration = () => {
        const iterations = [...mapIterations];
        iterations.push({
            name: `Iteration ${iterations.length + 1}`,
            mapText,
        });
        setMapIterations(iterations);
    };

    const saveMapText = (data: string, fileName: string) => {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        const blob = new Blob([data], { type: 'data:attachment/xml' });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
            if (saveOutstanding) {
                event.preventDefault();
                event.returnValue = '';
            }
        });
    });

    useEffect(() => {
        try {
            setErrorLine([]);
            setInvalid(false);
            const r = new Converter(featureSwitches).parse(mapText);
            console.log('MapEnvironment', r);
            setRawMapTitle(r.title);
            setMapAnnotations(r.annotations);
            setMapAnchors(r.anchors);
            setMapNotes(r.notes);
            setMapComponents(r.elements);
            setMapSubMaps(r.submaps);
            setMarkets(r.markets);
            setEcosystems(r.ecosystems);
            setMapEvolved(r.evolved);
            setMapPipelines(r.pipelines);
            setMapLinks(r.links);
            setMapUrls(r.urls);
            setMapMethods(r.methods);
            setMapAttitudes(r.attitudes);
            setMapStyle(r.presentation.style);
            setMapSize(r.presentation.size);
            setMapAccelerators(r.accelerators);
            setMapAnnotationsPresentation(r.presentation.annotations);
            setMapEvolutionStates({
                genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
                custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
                product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
                commodity: {
                    l1: r.evolution[3].line1,
                    l2: r.evolution[3].line2,
                },
            });
            if (r.errors.length > 0) {
                setErrorLine(r.errors.map((e) => e.line));
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }, [mapText]);

    useEffect(() => {
        document.title = mapTitle + ' - ' + Defaults.PageTitle;
    }, [mapTitle]);

    useEffect(() => {
        setMapDimensions({
            width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
            height: mapSize.height > 0 ? mapSize.height : getHeight(),
        });
    }, [mapOnlyView, hideNav, mapSize]);

    useEffect(() => {
        if (currentIteration > -1) {
            setMapTitle(
                rawMapTitle + ' [' + mapIterations[currentIteration].name + ']',
            );
        } else {
            setMapTitle(rawMapTitle);
        }
    }, [currentIteration, rawMapTitle, mapIterations]);

    useEffect(() => {
        switch (mapStyle) {
            case 'colour':
            case 'color':
                setMapStyleDefs(MapStyles.Colour);
                break;
            case 'wardley':
                setMapStyleDefs(MapStyles.Wardley);
                break;
            case 'dark':
                setMapStyleDefs(MapStyles.Dark);
                break;
            case 'handwritten':
                setMapStyleDefs(MapStyles.Handwritten);
                break;
            default:
                setMapStyleDefs(MapStyles.Plain);
        }
    }, [mapStyle]);

    useEffect(() => {
        if (shouldLoad) loadFromRemoteStorage();
    }, [shouldLoad]);

    useEffect(() => {
        const debouncedHandleResize = debounce(() => {
            const dimensions = {
                width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
                height: mapSize.height > 0 ? mapSize.height : getHeight(),
            };
            setMapDimensions(dimensions);
        }, 1);

        window.addEventListener('resize', debouncedHandleResize);
        debouncedHandleResize();

        return function cleanup() {
            window.removeEventListener('resize', debouncedHandleResize);
        };
    }, [mapSize]);

    useEffect(() => {
        const newDimensions = {
            width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
            height: mapSize.height > 0 ? mapSize.height : getHeight(),
        };
        setMapDimensions(newDimensions);
        setMapCanvasDimensions({
            width: getWidth(),
            height: getHeight(),
        });
    }, [mapOnlyView, hideNav]);

    useEffect(() => {
        const initialLoad = () => {
            setMapCanvasDimensions({
                width: getWidth(),
                height: getHeight(),
            });
        };

        const debouncedHandleCanvasResize = debounce(() => {
            setMapCanvasDimensions({
                width: getWidth(),
                height: getHeight(),
            });
        }, 500);

        window.addEventListener('load', initialLoad);
        window.addEventListener('resize', debouncedHandleCanvasResize);

        return function cleanup() {
            window.removeEventListener('resize', debouncedHandleCanvasResize);
            window.removeEventListener('load', initialLoad);
        };
    }, []);

    const submenu = [
        {
            name: showUsage ? 'Hide Usage' : 'Show Usage',
            icon: <HelpCenterIcon />,
            action: () => {
                toggleUsage();
            },
        },
    ];

    const shouldHideNav = () => {
        setHideNav(!hideNav);
    };

    return (
        <React.Fragment>
            <LeftNavigation
                toggleMenu={toggleMenu}
                menuVisible={menuVisible}
                submenu={submenu}
                toggleTheme={toggleTheme}
                isLightTheme={isLightTheme}
            />

            <Box
                id="top-nav-wrapper"
                sx={{ display: hideNav ? 'none' : 'block' }}
            >
                <NewHeader
                    mapOnlyView={mapOnlyView}
                    setMapOnlyView={setMapOnlyView}
                    currentUrl={currentUrl}
                    saveOutstanding={saveOutstanding}
                    mutateMapText={mutateMapText}
                    newMapClick={newMap}
                    saveMapClick={saveMap}
                    downloadMapImage={downloadMap}
                    showLineNumbers={showLineNumbers}
                    setShowLineNumbers={setShowLineNumbers}
                    showLinkedEvolved={showLinkedEvolved}
                    setShowLinkedEvolved={setShowLinkedEvolved}
                    downloadMapAsSVG={downloadMapAsSVG}
                    toggleMenu={toggleMenu}
                />

                <Breadcrumb currentUrl={currentUrl} />

                <NewMapIterations
                    mapIterations={mapIterations}
                    currentIteration={currentIteration}
                    setMapIterations={setMapIterations}
                    setMapText={setMapText}
                    addIteration={addIteration}
                    setCurrentIteration={setCurrentIteration}
                />
            </Box>

            <Grid container spacing={2} id="main" sx={{ marginTop: 0 }}>
                {mapOnlyView === false && (
                    <Grid
                        item
                        xs={12}
                        sm={4}
                        sx={{
                            paddingTop: '0!important',
                            borderRight: '2px solid rgba(0, 0, 0, 0.12)',
                        }}
                    >
                        <Editor
                            hideNav={hideNav}
                            isLightTheme={isLightTheme}
                            highlightLine={highlightLine}
                            mapText={mapText}
                            invalid={invalid}
                            mutateMapText={mutateMapText}
                            mapComponents={mapComponents}
                            mapAnchors={mapAnchors}
                            mapDimensions={mapDimensions}
                            mapMarkets={mapMarkets}
                            mapSubMaps={mapSubMaps}
                            errorLine={errorLine}
                            showLineNumbers={showLineNumbers}
                        />
                    </Grid>
                )}
                <Grid
                    item
                    xs={12}
                    sm={mapOnlyView ? 12 : 8}
                    ml={mapOnlyView ? 2 : 0}
                    className="map-view"
                    sx={{ backgroundColor: mapStyleDefs.containerBackground }}
                >
                    <ModKeyPressedProvider>
                        <MapView
                            shouldHideNav={shouldHideNav}
                            hideNav={hideNav}
                            mapTitle={mapTitle}
                            mapComponents={mapComponents}
                            mapMarkets={mapMarkets}
                            mapEcosystems={mapEcosystems}
                            mapSubMaps={mapSubMaps}
                            mapEvolved={mapEvolved}
                            mapPipelines={mapPipelines}
                            mapAnchors={mapAnchors}
                            mapLinks={mapLinks}
                            mapAttitudes={mapAttitudes}
                            mapAccelerators={mapAccelerators}
                            launchUrl={launchUrl}
                            mapNotes={mapNotes}
                            mapAnnotations={mapAnnotations}
                            mapAnnotationsPresentation={
                                mapAnnotationsPresentation
                            }
                            mapMethods={mapMethods}
                            mapStyleDefs={mapStyleDefs}
                            mapCanvasDimensions={mapCanvasDimensions}
                            mapDimensions={mapDimensions}
                            mapEvolutionStates={mapEvolutionStates}
                            mapRef={mapRef}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            evolutionOffsets={Defaults.EvoOffsets}
                            setHighlightLine={setHighlightLine}
                            setNewComponentContext={setNewComponentContext}
                            showLinkedEvolved={showLinkedEvolved}
                        />
                    </ModKeyPressedProvider>
                </Grid>
            </Grid>

            <Dialog
                maxWidth={'lg'}
                open={showUsage}
                onClose={() => setShowUsage(false)}
            >
                <DialogTitle>Usage </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Quick reference of all available map elements.You can
                        add an example to your map by clicking the available
                        links.
                    </DialogContentText>
                    <Box marginTop={2}>
                        <UsageInfo
                            mapStyleDefs={mapStyleDefs}
                            mutateMapText={mutateMapText}
                            mapText={mapText}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowUsage(false)}> Close </Button>
                </DialogActions>
            </Dialog>

            <QuickAdd
                newComponentContext={newComponentContext}
                mutateMapText={mutateMapText}
                setNewComponentContext={setNewComponentContext}
                mapText={mapText}
                mapStyleDefs={mapStyleDefs}
            />

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={actionInProgress}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </React.Fragment>
    );
};

export default MapEnvironment;
