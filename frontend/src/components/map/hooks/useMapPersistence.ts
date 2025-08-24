import Router from 'next/router';
import {useCallback, useEffect} from 'react';
import * as Defaults from '../../../constants/defaults';
import {useI18n} from '../../../hooks/useI18n';
import {LoadMap} from '../../../repository/LoadMap';
import {MapIteration, OwnApiWardleyMap} from '../../../repository/OwnApiWardleyMap';
import {SaveMap} from '../../../repository/SaveMap';

interface UseMapPersistenceProps {
    currentId: string;
    setCurrentId: React.Dispatch<React.SetStateAction<string>>;
    mapPersistenceStrategy: string;
    setMapPersistenceStrategy: React.Dispatch<React.SetStateAction<string>>;
    setShouldLoad: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentUrl: React.Dispatch<React.SetStateAction<string>>;
    setSaveOutstanding: React.Dispatch<React.SetStateAction<boolean>>;
    saveOutstanding: boolean;
    setActionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    mapIterations: MapIteration[];
    setMapIterations: React.Dispatch<React.SetStateAction<MapIteration[]>>;
    currentIteration: number;
    setCurrentIteration: React.Dispatch<React.SetStateAction<number>>;
    mapText: string;
    mutateMapText: (text: string) => void;
}

interface UseMapPersistenceReturn {
    saveToRemoteStorage: (hash: string) => Promise<void>;
    loadFromRemoteStorage: () => Promise<void>;
    newMap: (strategy: string) => void;
    saveMap: () => Promise<void>;
    addIteration: () => void;
}

export const useMapPersistence = (props: UseMapPersistenceProps): UseMapPersistenceReturn => {
    const {
        currentId,
        setCurrentId,
        mapPersistenceStrategy,
        setMapPersistenceStrategy,
        setShouldLoad,
        setCurrentUrl,
        setSaveOutstanding,
        saveOutstanding,
        setActionInProgress,
        mapIterations,
        setMapIterations,
        currentIteration,
        setCurrentIteration,
        mapText,
        mutateMapText,
    } = props;

    const {t} = useI18n();

    const saveToRemoteStorage = useCallback(
        async (hash: string) => {
            setActionInProgress(true);
            const mapToPersist: OwnApiWardleyMap = {
                mapText,
                imageData: '',
                mapIterations,
                readOnly: false,
            };

            const followOnActions = async (id: string) => {
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

            await SaveMap(mapPersistenceStrategy, mapToPersist, hash, followOnActions);
        },
        [currentId, mapPersistenceStrategy, mapText, mapIterations, setActionInProgress, setCurrentId, setCurrentUrl, setSaveOutstanding],
    );

    const loadFromRemoteStorage = useCallback(async () => {
        const followOnActions = (loadedMapPersistenceStrategy: string, map: OwnApiWardleyMap) => {
            setMapPersistenceStrategy(loadedMapPersistenceStrategy);
            setShouldLoad(false);
            mutateMapText(map.mapText);
            if (map.mapIterations && map.mapIterations.length > 0) {
                setMapIterations(map.mapIterations);
                setCurrentIteration(0);
                mutateMapText(map.mapIterations[0].mapText);
            }
            setCurrentUrl(window.location.href);

            if (window.location.hash.indexOf('#clone:') === 0) {
                setCurrentUrl(`(${t('map.unsaved', 'unsaved')})`);
                setSaveOutstanding(true);
                setCurrentId('');
                window.location.hash = '';
            }

            setSaveOutstanding(false);
            setActionInProgress(false);

            switch (loadedMapPersistenceStrategy) {
                case Defaults.MapPersistenceStrategy.Legacy:
                    break;
                default:
                    setMapPersistenceStrategy(loadedMapPersistenceStrategy);
                    break;
            }
        };

        setActionInProgress(true);
        setCurrentUrl('(loading...)');
        console.log('--- Set Load Strategy: ', mapPersistenceStrategy);
        await LoadMap(mapPersistenceStrategy, followOnActions, currentId);
    }, [
        mapPersistenceStrategy,
        currentId,
        setMapPersistenceStrategy,
        setShouldLoad,
        mutateMapText,
        setMapIterations,
        setCurrentIteration,
        setCurrentUrl,
        setSaveOutstanding,
        setCurrentId,
        setActionInProgress,
        t,
    ]);

    const newMap = useCallback(
        (strategy: string) => {
            mutateMapText('');
            setCurrentId('');
            setCurrentUrl(`(${t('map.unsaved', 'unsaved')})`);
            setSaveOutstanding(false);
            setCurrentIteration(-1);
            setMapIterations([]);
            setMapPersistenceStrategy(strategy);
            Router.push({pathname: '/'}, undefined, {shallow: true});
        },
        [
            mutateMapText,
            setCurrentId,
            setCurrentUrl,
            setSaveOutstanding,
            setCurrentIteration,
            setMapIterations,
            setMapPersistenceStrategy,
            t,
        ],
    );

    const saveMap = useCallback(async () => {
        setCurrentUrl(`(${t('map.saving', 'saving...')})`);
        await saveToRemoteStorage(currentId);
    }, [setCurrentUrl, t, saveToRemoteStorage, currentId]);

    const addIteration = useCallback(() => {
        const iterations = [...mapIterations];
        iterations.push({
            name: `Iteration ${iterations.length + 1}`,
            mapText,
        });
        setMapIterations(iterations);
    }, [mapIterations, mapText, setMapIterations]);

    // Handle beforeunload event to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (saveOutstanding) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveOutstanding]);

    return {
        saveToRemoteStorage,
        loadFromRemoteStorage,
        newMap,
        saveMap,
        addIteration,
    };
};
