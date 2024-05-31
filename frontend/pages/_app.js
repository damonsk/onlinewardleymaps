import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components';
import { ThemeProvider as MaterialUIThemeProvider } from '@mui/material/styles';
import StylesProvider from '@mui/styles/StylesProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { theme, lightTheme } from '../src/theme';
import { AmplifyAuthProvider } from '../src/contexts/auth';
import { configureAmplify } from '../src/lib/amplify/awsConfig';
import Footer from '../src/components/page/Footer';
import { Hub } from 'aws-amplify/utils';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser, signOut as awsSignOut } from 'aws-amplify/auth';
import { Modal, Box } from '@mui/material';
import '@aws-amplify/ui-react/styles.css';
import { FeatureSwitchesProvider } from '../src/components/FeatureSwitchesContext';
import { featureSwitches } from '../src/constants/featureswitches';

configureAmplify();

function MyApp({ Component, pageProps }) {
	useEffect(() => {
		const jssStyles = document.querySelector('#jss-server-side');
		if (jssStyles && jssStyles.parentNode) {
			jssStyles.parentNode.removeChild(jssStyles);
		}
	}, []);

	const [hideAuthModal, setHideAuthModal] = useState(true);
	const [user, setUser] = useState();
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

	useEffect(() => {
		async function currentAuthenticatedUser() {
			try {
				const { username, userId, signInDetails } = await getCurrentUser();
				setUser({ username, userId, signInDetails });
				console.log('[_app::useEffect]', {
					username,
					userId,
					signInDetails,
				});
			} catch (err) {
				console.log(err);
				setUser(null);
			}
		}
		let updateUser = async (authState) => {
			try {
				await currentAuthenticatedUser();

				if (authState !== undefined && authState.payload.event === 'signIn') {
					setHideAuthModal(true);
				}
				if (authState !== undefined) {
					console.log('[_app::useEffect]', authState.payload.event);
				}
			} catch (e) {
				console.log(e);
				setUser(null);
			}
		};
		Hub.listen('auth', updateUser); // listen for login/signup events
		updateUser(undefined); // check manually the first time because we won't get a Hub event
		return () => Hub.remove('auth', updateUser); // cleanup
	}, []);

	useEffect(() => {
		if (user === null) setHideAuthModal(true);
	}, [user]);

	async function signOut() {
		try {
			await awsSignOut();
		} catch (error) {
			console.log('error signing out: ', error);
		}
	}

	const signUpConfig = {
		signUpFields: [
			{
				label: 'Email',
				key: 'email',
				required: true,
				displayOrder: 1,
				type: 'email',
			},
			{
				label: 'Password',
				key: 'password',
				required: true,
				displayOrder: 1,
				type: 'password',
			},
		],
	};

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
				<AmplifyAuthProvider>
					<StylesProvider injectFirst>
						<MaterialUIThemeProvider theme={currentTheme}>
							<StyledComponentsThemeProvider theme={currentTheme}>
								<CssBaseline />

								<Component
									{...pageProps}
									toggleTheme={toggleTheme}
									toggleMenu={toggleMenu}
									menuVisible={menuVisible}
									user={user}
									signOut={signOut}
									setHideAuthModal={setHideAuthModal}
									isLightTheme={isLightTheme}
								/>
								<Modal
									open={!hideAuthModal}
									onClose={() => setHideAuthModal(true)}
									aria-labelledby="modal-modal-title"
									aria-describedby="modal-modal-description"
								>
									<Box>
										<Authenticator
											signUpConfig={signUpConfig}
											theme={currentTheme}
										></Authenticator>
									</Box>
								</Modal>
								<Footer />
							</StyledComponentsThemeProvider>
						</MaterialUIThemeProvider>
					</StylesProvider>
				</AmplifyAuthProvider>
			</FeatureSwitchesProvider>
		</>
	);
}

export default MyApp;
