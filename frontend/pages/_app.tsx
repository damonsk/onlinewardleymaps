import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider as MaterialUIThemeProvider} from '@mui/material/styles';
import StylesProvider from '@mui/styles/StylesProvider';
import {appWithTranslation} from 'next-i18next';
import {AppProps} from 'next/app';
import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import {ThemeProvider as StyledComponentsThemeProvider} from 'styled-components';
import nextI18NextConfig from '../next-i18next.config.js';
import {FeatureSwitchesProvider} from '../src/components/FeatureSwitchesContext';
import Footer from '../src/components/page/Footer';
import {featureSwitches} from '../src/constants/featureswitches';
import {lightTheme, theme} from '../src/theme';

const MyApp: React.FC<AppProps> = ({Component, pageProps}) => {
    useEffect(() => {
        const jssStyles = document.querySelector<HTMLStyleElement>('#jss-server-side');
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }, []);

    const [currentTheme, setCurrentTheme] = useState(theme);
    const [isLightTheme, setIsLightTheme] = useState<boolean>(false);
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

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
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
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
};

export default appWithTranslation(MyApp, nextI18NextConfig);
