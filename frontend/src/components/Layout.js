import React from 'react';
import { Authenticator, Greetings } from 'amplify-material-ui';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Modal } from '@mui/material';

const Layout = props => {
	const { hideAuthModal, setHideAuthModal, children, currentTheme } = props;

	const components = {
		Footer() {
			return (
				<div id="modalFooter">
					<button
						className="amplify-button"
						onClick={() => setHideAuthModal(true)}
						data-variation="primary"
					>
						Cancel
					</button>
				</div>
			);
		},
	};
	return (
		<ThemeProvider theme={currentTheme}>
			<CssBaseline />
			<React.Fragment>
				{children}

				<Modal
					open={!hideAuthModal}
					onClose={() => setHideAuthModal(true)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Authenticator
						components={components}
						theme={currentTheme}
						{...{
							hide: [Greetings],
						}}
					/>
				</Modal>
			</React.Fragment>
		</ThemeProvider>
	);
};

export default Layout;
