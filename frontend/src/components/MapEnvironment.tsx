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
import { GetCurrentUserOutput } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import html2canvas from 'html2canvas';
import Router from 'next/router';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import * as Defaults from '../constants/defaults';
import * as MapStyles from '../constants/mapstyles';
import { MapTheme } from '../constants/mapstyles';
import Converter, {
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
    MapUrls,
} from '../conversion/Converter';
import { MapAnnotationsPosition } from '../conversion/PresentationExtractionStrategy';
import { LoadMap } from '../repository/LoadMap';
import { MapIteration, OwnApiWardleyMap } from '../repository/OwnApiWardleyMap';
import { SaveMap } from '../repository/SaveMap';
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

    return function(this: any, ...args: Parameters<T>): void {
        clearTimeout(timer!);
        timer = setTimeout(() => {
            timer = null;
            fn.apply(this, args);
        }, ms);
    };
}

function convertToImage(base64Data: string, contentType: string) {
    base64Data = base64Data.replace('data:image/png;base64,', '');
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

const getHeight = () => {
    const winHeight = window.innerHeight;
    const topNavHeight = document.getElementById('top-nav-wrapper')
        ?.clientHeight;
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
    signOut: () => void;
    setHideAuthModal: () => React.Dispatch<React.SetStateAction<boolean>>;
    menuVisible: boolean;
    isLightTheme: boolean;
    user: GetCurrentUserOutput;
    mapPersistenceStrategy: Defaults.MapPersistenceStrategy;
    setMapPersistenceStrategy: React.Dispatch<
        React.SetStateAction<Defaults.MapPersistenceStrategy>
    >;
    shouldLoad: boolean;
    setShouldLoad: React.Dispatch<React.SetStateAction<boolean>>;
    currentId: string;
    setCurrentId: React.Dispatch<React.SetStateAction<string>>;
}

const MapEnvironment: FunctionComponent<MapEnvironmentProps> = ({
    toggleMenu,
    menuVisible,
    toggleTheme,
    signOut,
    user,
    setHideAuthModal,
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
    const [metaText, setMetaText] = useState('');
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
    const [mapAnnotations, setMapAnnotations] = useState<MapAnnotations>({
        occurances: [],
    });
    const [mapAccelerators, setMapAccelerators] = useState<MapAccelerators[]>(
        [],
    );
    const [mapMethods, setMapMethods] = useState<MapMethods[]>([]);
    const [invalid, setInvalid] = useState(false);
    const [newComponentContext, setNewComponentContext] = useState(null);
    const [
        mapAnnotationsPresentation,
        setMapAnnotationsPresentation,
    ] = useState<MapAnnotationsPosition>({ maturity: 0, visibility: 0 });
    const [mapIterations, setMapIterations] = useState<MapIteration[]>([]);
    const [mapDimensions, setMapDimensions] = useState(Defaults.MapDimensions);
    const [mapEvolutionStates, setMapEvolutionStates] = useState<
        Defaults.EvolutionStages
    >(Defaults.EvolutionStages);
    const [mapStyle, setMapStyle] = useState('plain');
    const [mapStyleDefs, setMapStyleDefs] = useState<MapTheme>(MapStyles.Plain);
    const [saveOutstanding, setSaveOutstanding] = useState(false);
    const [highlightLine, setHighlightLine] = useState(0);

    const [errorLine, setErrorLine] = useState<number[]>([]);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [showLinkedEvolved, setShowLinkedEvolved] = useState(false);
    const [mapOwner, setMapOwner] = useState('');
    const [isMapReadOnly, setMapReadOnly] = useState(false);
    const [canSaveMap, setCanSaveMap] = useState(false);
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
        const mapUrl = mapUrls.find(u => u.name === urlId);
        if (mapUrl) {
            window.open(mapUrl.url);
        }
    };

    const toggleUsage = () => {
        setShowUsage(!showUsage);
    };

    const saveToRemoteStorage = async function(hash: string) {
        setActionInProgress(true);
        const mapToPersist: OwnApiWardleyMap = {
            mapText,
            imageData: '',
            mapIterations,
            owner: mapOwner,
            readOnly: false,
        };

        const followOnActions = async function(id: string) {
            if (
                mapPersistenceStrategy ===
                Defaults.MapPersistenceStrategy.Private
            ) {
                const imageData = await makeSnapShot();
                await createImage(imageData, 'private', id + '.png');
            }
            if (
                mapPersistenceStrategy ===
                Defaults.MapPersistenceStrategy.Public
            ) {
                const imageData = await makeSnapShot();
                await createImage(imageData, 'public', id + '.png');
            }
            if (currentId === '') {
                console.log('[followOnActions::switch]', {
                    mapPersistenceStrategy,
                    currentId,
                    id,
                });
                switch (mapPersistenceStrategy) {
                    case Defaults.MapPersistenceStrategy.Private:
                        Router.push('/private' + '/' + id, undefined, {
                            shallow: true,
                        });
                        break;
                    case Defaults.MapPersistenceStrategy.Legacy:
                        window.location.hash = '#' + id;
                        break;
                    case Defaults.MapPersistenceStrategy.Public:
                        window.location.hash = '#public:' + id;
                        break;
                    default:
                    case Defaults.MapPersistenceStrategy.PublicUnauthenticated:
                        Router.push('/public' + '/' + id, undefined, {
                            shallow: true,
                        });
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

            async function createImage(
                imageData: string | undefined,
                level: string,
                filename: string,
            ) {
                if (imageData === undefined) return;
                return uploadData({
                    key: filename,
                    data: convertToImage(imageData, 'image/png'),
                    options: {
                        // level: level,
                        contentType: 'image/png',
                    },
                });
            }
        };

        await SaveMap(
            mapPersistenceStrategy,
            mapToPersist,
            hash,
            followOnActions,
        );
    };

    const loadFromRemoteStorage = async function() {
        const followOnActions = (
            mapPersistenceStrategy: Defaults.MapPersistenceStrategy,
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
                    console.log(
                        '--- Need to migrate this map to PublicUnauthd',
                    );
                    setMapOwner('');
                    break;
                default:
                    setMapPersistenceStrategy(mapPersistenceStrategy);
                    setMapOwner(map.owner || '');
                    setMapReadOnly(map.readOnly || false);
                    break;
            }
        };

        setActionInProgress(true);
        setCurrentUrl('(loading...)');
        console.log('--- Set Load Strategy: ', mapPersistenceStrategy);
        await LoadMap(mapPersistenceStrategy, followOnActions, currentId);
    };

    function newMap(mapPersistenceStrategy: Defaults.MapPersistenceStrategy) {
        setMapText('');
        setMetaText('');
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
        html2canvas(mapRef.current).then(canvas => {
            const base64image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = mapTitle;
            link.href = base64image;
            link.click();
        });
    }

    function downloadMapAsSVG() {
        if (mapRef.current === null) return;
        const svgMapText = mapRef.current
            .getElementsByTagName('svg')[0]
            .outerHTML.replace(/&nbsp;/g, ' ');
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

    async function makeSnapShot() {
        if (mapRef.current) {
            return await html2canvas(mapRef.current).then(canvas => {
                const base64image = canvas.toDataURL('image/png');
                return base64image;
            });
        }
    }

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
                setErrorLine(r.errors.map(e => e.line));
            }
        } catch (err) {
            console.log('Error:', err);
        }
    }, [mapText]);

    useEffect(() => {
        document.title = mapTitle + ' - ' + Defaults.PageTitle;
    }, [mapTitle]);

    useEffect(() => {
        setMapDimensions({ width: getWidth(), height: getHeight() });
        // setMainViewHeight(105 + getHeight());
    }, [mapOnlyView, hideNav]);

    useEffect(() => {
        console.log('[currentIteration, rawMapTitle, mapIterations]', [
            currentIteration,
            rawMapTitle,
            mapIterations,
        ]);
        if (currentIteration > -1) {
            setMapTitle(
                rawMapTitle + ' [' + mapIterations[currentIteration].name + ']',
            );
        } else {
            setMapTitle(rawMapTitle);
        }
    }, [currentIteration, rawMapTitle, mapIterations]);

    useEffect(() => {
        if (
            mapPersistenceStrategy ===
                Defaults.MapPersistenceStrategy.PublicUnauthenticated ||
            mapPersistenceStrategy === Defaults.MapPersistenceStrategy.Legacy
        ) {
            setCanSaveMap(true);
        }
        if (mapOwner) {
            console.log('--- MapOwner: ' + mapOwner);
            if (user !== null && mapOwner === user.username) {
                setCanSaveMap(true);
                console.log('--- Can Save Map (MapOwner)');
                return;
            }
            if (
                user !== null &&
                mapOwner !== user.username &&
                mapPersistenceStrategy !==
                    Defaults.MapPersistenceStrategy.Private &&
                !isMapReadOnly
            ) {
                setCanSaveMap(true);
                console.log(
                    '--- Can Save Map (Public, Logged In, Not Read Only)',
                );
                return;
            }
            console.log('--- Cannot Save Map');
            setCanSaveMap(false);
        }
    }, [mapOwner, user, isMapReadOnly, mapPersistenceStrategy]);

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
            setMapDimensions({ width: getWidth(), height: getHeight() });
        }, 1000);

        const initialLoad = () => {
            setMapDimensions({ width: getWidth(), height: getHeight() });
        };

        window.addEventListener('resize', debouncedHandleResize);
        window.addEventListener('load', initialLoad);

        debouncedHandleResize();

        return function cleanup() {
            window.removeEventListener('resize', debouncedHandleResize);
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
                user={user}
                setHideAuthModal={setHideAuthModal}
            />

            <Box
                id="top-nav-wrapper"
                sx={{ display: hideNav ? 'none' : 'block' }}
            >
                <NewHeader
                    mapOnlyView={mapOnlyView}
                    setMapOnlyView={setMapOnlyView}
                    user={user}
                    signOut={signOut}
                    setHideAuthModal={setHideAuthModal}
                    currentUrl={currentUrl}
                    saveOutstanding={saveOutstanding}
                    setMetaText={setMetaText}
                    mutateMapText={mutateMapText}
                    newMapClick={newMap}
                    saveMapClick={saveMap}
                    downloadMapImage={downloadMap}
                    showLineNumbers={showLineNumbers}
                    setShowLineNumbers={setShowLineNumbers}
                    showLinkedEvolved={showLinkedEvolved}
                    setShowLinkedEvolved={setShowLinkedEvolved}
                    downloadMapAsSVG={downloadMapAsSVG}
                    canSaveMap={canSaveMap}
                    toggleMenu={toggleMenu}
                />

                <Breadcrumb
                    currentUrl={currentUrl}
                    mapPersistenceStrategy={mapPersistenceStrategy}
                    mapReadOnly={isMapReadOnly}
                />

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
                            mapDimensions={mapDimensions}
                            mapEvolutionStates={mapEvolutionStates}
                            mapRef={mapRef}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            setMetaText={setMetaText}
                            metaText={metaText}
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
                sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
                open={actionInProgress}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </React.Fragment>
    );
};

export default MapEnvironment;
