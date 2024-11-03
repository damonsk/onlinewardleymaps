import React from 'react';
import CoreHeader from './CoreHeader';

export interface DashboardHeaderProps {
    toggleMenu: any;
}

const DashboardHeader: React.FunctionComponent<DashboardHeaderProps> = ({
    toggleMenu,
}) => {
    return <CoreHeader toggleMenu={toggleMenu} />;
};

export default DashboardHeader;
