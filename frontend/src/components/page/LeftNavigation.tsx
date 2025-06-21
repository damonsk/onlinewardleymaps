import DarkModeIcon from '@mui/icons-material/DarkMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightModeIcon from '@mui/icons-material/LightMode';
import MapIcon from '@mui/icons-material/Map';
import {ListItemButton} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Router from 'next/router';
import React, {FunctionComponent, KeyboardEvent, useMemo} from 'react';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {useI18n} from '../../hooks/useI18n';

export interface LeftNavigationProps {
    toggleMenu: () => void;
    toggleTheme: () => void;
    menuVisible: boolean;
    isLightTheme: boolean;
    submenu: {
        name: string;
        icon: React.JSX.Element;
        action: () => void;
    }[];
}

export const LeftNavigation: FunctionComponent<LeftNavigationProps> = ({menuVisible, toggleMenu, submenu, toggleTheme, isLightTheme}) => {
    const {enableDashboard} = useFeatureSwitches();
    const {t, currentLanguage} = useI18n();
    const history = {
        push: (url: string) => {
            Router.push({
                pathname: url,
            });
        },
    };
    const toggleDrawer = () => (event: KeyboardEvent) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        toggleMenu();
    };

    const complete = (followAction: () => void) => {
        toggleMenu();
        if (followAction) followAction();
    };

    const siteLinks = useMemo(
        () => [
            {
                name: t('navigation.dashboard', 'Dashboard'),
                icon: <DashboardIcon />,
                action: () => complete(() => history.push('/dashboard')),
                visible: enableDashboard,
            },
            {
                name: t('navigation.editor', 'Editor'),
                icon: <MapIcon />,
                action: () => complete(() => history.push('/')),
                visible: true,
            },
            {
                name: t('navigation.classicVersion', 'Use Classic Version'),
                icon: <MapIcon />,
                action: () => complete(() => history.push('https://classic.onlinewardleymaps.com')),
                visible: true,
            },
        ],
        [t, enableDashboard],
    );

    const themeToggleText = useMemo(
        () =>
            isLightTheme ? t('navigation.enableDarkTheme', 'Enable Dark Theme') : t('navigation.enableLightTheme', 'Enable Light Theme'),
        [t, isLightTheme],
    );

    const list = (
        <Box sx={{width: '285px'}} role="presentation" onClick={() => toggleDrawer()} onKeyDown={() => toggleDrawer()}>
            <List>
                {siteLinks
                    .filter(i => i.visible === true)
                    .map(l => (
                        <ListItemButton key={l.name} onClick={l.action}>
                            <ListItemIcon>{l.icon}</ListItemIcon>
                            <ListItemText primary={l.name} />
                        </ListItemButton>
                    ))}
            </List>
            <Divider />
            <List>
                {submenu &&
                    submenu.map(l => (
                        <ListItemButton key={l.name} onClick={() => complete(() => l.action())}>
                            <ListItemIcon>{l.icon}</ListItemIcon>
                            <ListItemText primary={l.name} />
                        </ListItemButton>
                    ))}
            </List>
            <Divider />
            <List>
                <ListItemButton key={'toggleTheme'} onClick={() => complete(() => toggleTheme())}>
                    <ListItemIcon>{isLightTheme ? <DarkModeIcon /> : <LightModeIcon />}</ListItemIcon>
                    <ListItemText primary={themeToggleText} />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <div key={`navigation-${currentLanguage}`}>
            <Drawer anchor={'left'} open={menuVisible} onClose={toggleMenu}>
                {list}
            </Drawer>
        </div>
    );
};
