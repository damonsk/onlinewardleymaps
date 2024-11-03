import { GetCurrentUserOutput } from 'aws-amplify/auth';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useFeatureSwitches } from '../src/components/FeatureSwitchesContext';
import MapEnvironment from '../src/components/MapEnvironment';
import { MapPersistenceStrategy } from '../src/constants/defaults';

interface MapProps {
    toggleTheme: () => void;
    toggleMenu: () => void;
    signOut: () => void;
    setHideAuthModal: () => React.Dispatch<React.SetStateAction<boolean>>;
    menuVisible: boolean;
    isLightTheme: boolean;
    user: GetCurrentUserOutput;
}

const Map: React.FC<MapProps> = props => {
    const { enableDashboard } = useFeatureSwitches();
    const router = useRouter();
    const { user } = props;
    const { slug } = router.query;
    const [currentId, setCurrentId] = useState('');
    const [mapOwner, setMapOwner] = useState('');
    const [isMapReadOnly, setMapReadOnly] = useState(false);
    const [canSaveMap, setCanSaveMap] = useState(false);
    const [mapPersistenceStrategy, setMapPersistenceStrategy] = useState(
        enableDashboard === true
            ? MapPersistenceStrategy.PublicUnauthenticated
            : MapPersistenceStrategy.Legacy,
    );
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        setMapOwner('');
        setMapReadOnly(false);
    }, [canSaveMap]);

    useEffect(() => {
        console.log('slug', slug);
        if (slug === undefined) {
            if (
                typeof window !== 'undefined' &&
                window.location.hash.length > 0
            ) {
                setMapPersistenceStrategy(MapPersistenceStrategy.Legacy);
                let mapId = window.location.hash.replace('#', '');
                if (mapId.includes(':')) {
                    mapId = mapId.split(':')[1];
                }
                setCurrentId(mapId);
                setShouldLoad(true);
            }
            return;
        }
        if (slug[0] !== undefined) {
            switch (slug[0]) {
                case 'public':
                    setMapPersistenceStrategy(
                        MapPersistenceStrategy.PublicUnauthenticated,
                    );
                    break;
                case 'user':
                    setMapPersistenceStrategy(MapPersistenceStrategy.Public);
                    break;
                case 'private':
                    setMapPersistenceStrategy(MapPersistenceStrategy.Private);
                    break;
            }
        }

        if (slug[1] !== undefined && slug[1] !== null) {
            setCurrentId(slug[1]);
            setShouldLoad(true);
        }
    }, [slug]);

    useEffect(() => {
        console.log('[slug::useEffect::currentId]', currentId);
    }, [currentId]);

    useEffect(() => {
        if (
            mapPersistenceStrategy ===
            MapPersistenceStrategy.PublicUnauthenticated
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
                mapPersistenceStrategy !== MapPersistenceStrategy.Private &&
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

    return (
        <MapEnvironment
            toggleMenu={props.toggleMenu}
            toggleTheme={props.toggleTheme}
            signOut={props.signOut}
            setHideAuthModal={props.setHideAuthModal}
            menuVisible={props.menuVisible}
            isLightTheme={props.isLightTheme}
            user={props.user}
            currentId={currentId}
            setCurrentId={setCurrentId}
            mapPersistenceStrategy={mapPersistenceStrategy}
            setMapPersistenceStrategy={setMapPersistenceStrategy}
            shouldLoad={shouldLoad}
            setShouldLoad={setShouldLoad}
        />
    );
};

export default Map;
