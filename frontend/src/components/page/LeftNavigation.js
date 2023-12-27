import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Router from 'next/router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';
import { featureSwitches } from '../../constants/featureswitches';

export default function LeftNavigation({
	menuVisible,
	toggleMenu,
	submenu,
	toggleTheme,
	isLightTheme,
	setHideAuthModal,
	user,
}) {
	const history = {
		push: (url) => {
			Router.push({
				pathname: url,
			});
		},
	};
	const toggleDrawer = () => (event) => {
		if (
			event.type === 'keydown' &&
			(event.key === 'Tab' || event.key === 'Shift')
		) {
			return;
		}
		toggleMenu();
	};

	const complete = (followAction) => {
		toggleMenu();
		if (typeof followAction === 'function') followAction();
	};

	const siteLinks = [
		{
			name: 'Dashboard',
			icon: <DashboardIcon />,
			action: () => complete(history.push('/dashboard')),
			visible: featureSwitches.enableDashboard,
		},
		{
			name: 'Editor',
			icon: <MapIcon />,
			action: () => complete(history.push('/')),
			visible: true,
		},
		{
			name: 'Use Classic Version',
			icon: <MapIcon />,
			action: () =>
				complete(history.push('https://classic.onlinewardleymaps.com')),
			visible: true,
		},
		{
			name: user !== null ? 'Logout' : 'Login',
			icon: <PersonIcon />,
			action: () => complete(setHideAuthModal(false)),
			visible: featureSwitches.enableDashboard,
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
					.filter((i) => i.visible === true)
					.map((l) => (
						<ListItem button key={l.name} onClick={l.action}>
							<ListItemIcon>{l.icon}</ListItemIcon>
							<ListItemText primary={l.name} />
						</ListItem>
					))}
			</List>
			<Divider />
			<List>
				{submenu &&
					submenu.map((l) => (
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
					onClick={() => complete(toggleTheme())}
				>
					<ListItemIcon>
						{isLightTheme ? <DarkModeIcon /> : <LightModeIcon />}
					</ListItemIcon>
					<ListItemText
						primary={isLightTheme ? 'Enable Dark Theme' : 'Enable Light Theme'}
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
}
