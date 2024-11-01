import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components';
import { ThemeProvider as MaterialUIThemeProvider } from '@mui/material/styles';
import StylesProvider from '@mui/styles/StylesProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { theme, lightTheme } from '../src/theme';
import Footer from '../src/components/page/Footer';
import { FeatureSwitchesProvider } from '../src/components/FeatureSwitchesContext';
import { featureSwitches } from '../src/constants/featureswitches';

function MyApp({ Component, pageProps }) {
	useEffect(() => {
		const jssStyles = document.querySelector('#jss-server-side');
		if (jssStyles && jssStyles.parentNode) {
			jssStyles.parentNode.removeChild(jssStyles);
		}
	}, []);

	const [currentTheme, setCurrentTheme] = useState(theme);
	const [isLightTheme, setIsLightTheme] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);
	const toggleMenu = () => {
		setMenuVisible(!menuVisible);
	};

	const toggleTheme = () => {
		setIsLightTheme(!isLightTheme);
	};

	useEffect(() => {
		setCurrentTheme(isLightTheme ? lightTheme : theme);
	}, [isLightTheme]);

	return (
		<>
			<Head>
				<title>OnlineWardleyMaps.com</title>
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width"
				/>
			</Head>
			<FeatureSwitchesProvider value={featureSwitches}>
				<StylesProvider injectFirst>
					<MaterialUIThemeProvider theme={currentTheme}>
						<StyledComponentsThemeProvider theme={currentTheme}>
							<CssBaseline />

							<Component
								{...pageProps}
								toggleTheme={toggleTheme}
								toggleMenu={toggleMenu}
								menuVisible={menuVisible}
								isLightTheme={isLightTheme}
							/>
							<Footer />
						</StyledComponentsThemeProvider>
					</MaterialUIThemeProvider>
				</StylesProvider>
			</FeatureSwitchesProvider>
		</>
	);
}

export default MyApp;
