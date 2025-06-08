import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import MapEnvironment from '../src/components/MapEnvironment';
import {MapPersistenceStrategy} from '../src/constants/defaults';

interface MapProps {
    toggleTheme: () => void;
    toggleMenu: () => void;
    menuVisible: boolean;
    isLightTheme: boolean;
}

const Map: React.FC<MapProps> = props => {
    const router = useRouter();
    const {slug} = router.query;
    const [currentId, setCurrentId] = useState('');
    const [mapPersistenceStrategy, setMapPersistenceStrategy] = useState(MapPersistenceStrategy.Legacy);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (slug === undefined) {
            if (typeof window !== 'undefined' && window.location.hash.length > 0) {
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
    }, [slug]);

    return (
        <MapEnvironment
            toggleMenu={props.toggleMenu}
            toggleTheme={props.toggleTheme}
            menuVisible={props.menuVisible}
            isLightTheme={props.isLightTheme}
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
