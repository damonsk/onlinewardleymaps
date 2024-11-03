import DarkModeIcon from '@mui/icons-material/DarkMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightModeIcon from '@mui/icons-material/LightMode';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { GetCurrentUserOutput } from 'aws-amplify/auth';
import Router from 'next/router';
import React, { FunctionComponent, KeyboardEvent } from 'react';
import { useFeatureSwitches } from '../FeatureSwitchesContext';

export interface LeftNavigationProps {
    toggleMenu: () => void;
    toggleTheme: () => void;
    user: GetCurrentUserOutput;
    menuVisible: boolean;
    isLightTheme: boolean;
    setHideAuthModal: (
        state: boolean,
    ) => React.Dispatch<React.SetStateAction<boolean>>;
    submenu: {
        name: string;
        icon: React.JSX.Element;
        action: () => void;
    }[];
}

export const LeftNavigation: FunctionComponent<LeftNavigationProps> = ({
    menuVisible,
    toggleMenu,
    submenu,
    toggleTheme,
    isLightTheme,
    setHideAuthModal,
    user,
}) => {
    const { enableDashboard } = useFeatureSwitches();
    const history = {
        push: (url: string) => {
            Router.push({
                pathname: url,
            });
        },
    };
    const toggleDrawer = () => (event: KeyboardEvent) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        toggleMenu();
    };

    const complete = (followAction: () => void) => {
        toggleMenu();
        if (followAction) followAction();
    };

    const siteLinks = [
        {
            name: 'Dashboard',
            icon: <DashboardIcon />,
            action: () => complete(() => history.push('/dashboard')),
            visible: enableDashboard,
        },
        {
            name: 'Editor',
            icon: <MapIcon />,
            action: () => complete(() => history.push('/')),
            visible: true,
        },
        {
            name: 'Use Classic Version',
            icon: <MapIcon />,
            action: () =>
                complete(() =>
                    history.push('https://classic.onlinewardleymaps.com'),
                ),
            visible: true,
        },
        {
            name: user !== null ? 'Logout' : 'Login',
            icon: <PersonIcon />,
            action: () => complete(() => setHideAuthModal(false)),
            visible: enableDashboard,
        },
    ];

    const list = (
        <Box
            sx={{ width: '285px' }}
            role="presentation"
            onClick={() => toggleDrawer()}
            onKeyDown={() => toggleDrawer()}
        >
            <List>
                {siteLinks
                    .filter(i => i.visible === true)
                    .map(l => (
                        <ListItem button key={l.name} onClick={l.action}>
                            <ListItemIcon>{l.icon}</ListItemIcon>
                            <ListItemText primary={l.name} />
                        </ListItem>
                    ))}
            </List>
            <Divider />
            <List>
                {submenu &&
                    submenu.map(l => (
                        <ListItem
                            button
                            key={l.name}
                            onClick={() => complete(() => l.action())}
                        >
                            <ListItemIcon>{l.icon}</ListItemIcon>
                            <ListItemText primary={l.name} />
                        </ListItem>
                    ))}
            </List>
            <Divider />
            <List>
                <ListItem
                    button
                    key={'toggleTheme'}
                    onClick={() => complete(() => toggleTheme())}
                >
                    <ListItemIcon>
                        {isLightTheme ? <DarkModeIcon /> : <LightModeIcon />}
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            isLightTheme
                                ? 'Enable Dark Theme'
                                : 'Enable Light Theme'
                        }
                    />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <div>
            <Drawer anchor={'left'} open={menuVisible} onClose={toggleMenu}>
                {list}
            </Drawer>
        </div>
    );
};
