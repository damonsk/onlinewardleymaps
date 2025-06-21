import DarkModeIcon from '@mui/icons-material/DarkMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightModeIcon from '@mui/icons-material/LightMode';
import MapIcon from '@mui/icons-material/Map';
import LanguageIcon from '@mui/icons-material/Language';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {ListItemButton} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Router from 'next/router';
import React, {FunctionComponent, KeyboardEvent, useMemo, useState} from 'react';
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
    const {t, currentLanguage, changeLanguage, supportedLanguages} = useI18n();
    const [anchorLanguageEl, setAnchorLanguageEl] = useState<Element | null>(null);

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

    const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorLanguageEl(event.currentTarget);
    };

    const handleLanguageMenuClose = () => {
        setAnchorLanguageEl(null);
    };

    const handleLanguageSelect = async (languageCode: string) => {
        await changeLanguage(languageCode);
        setAnchorLanguageEl(null);
        toggleMenu(); // Close the main navigation drawer as well
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
                <ListItemButton key={'language'} onClick={handleLanguageClick}>
                    <ListItemIcon>
                        <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('navigation.language', 'Language')} />
                    <ChevronRightIcon />
                </ListItemButton>
            </List>
        </Box>
    );

    const languageMenu = (
        <Menu
            anchorEl={anchorLanguageEl}
            open={Boolean(anchorLanguageEl)}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}>
            {supportedLanguages.map(language => (
                <MenuItem
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    selected={currentLanguage === language.code}>
                    {language.nativeName}
                </MenuItem>
            ))}
        </Menu>
    );

    return (
        <div key={`navigation-${currentLanguage}`}>
            <Drawer anchor={'left'} open={menuVisible} onClose={toggleMenu}>
                {list}
            </Drawer>
            {languageMenu}
        </div>
    );
};
