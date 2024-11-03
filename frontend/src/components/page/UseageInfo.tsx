import React from 'react';
import { MapTheme } from '../../constants/mapstyles';
import Usage from '../editor/Usage';

interface UsageInfoProps {
    mapText: any;
    mutateMapText: any;
    mapStyleDefs: MapTheme;
}

export const UsageInfo: React.FunctionComponent<UsageInfoProps> = ({
    mapText,
    mutateMapText,
    mapStyleDefs,
}) => {
    return (
        <div className="row usage no-gutters">
            <div className="col">
                <Usage
                    mapStyleDefs={mapStyleDefs}
                    mapText={mapText}
                    mutateMapText={mutateMapText}
                />
            </div>
        </div>
    );
};
