import React from 'react';
import { Grid, Link, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

function Footer() {
	const StyledFooter = styled((props) => (
		<Grid container padding={4} {...props} />
	))(({ theme }) => ({
		backgroundColor:
			theme.palette.mode === 'light'
				? theme.palette.grey[300]
				: theme.palette.background.paper,
		borderTop: `2px solid ${theme.palette.divider}`,
		'& .gh-icon': {
			fill: theme.palette.mode === 'light' ? 'black' : 'white',
			verticalAlign: 'bottom',
		},
	}));

	return (
		<StyledFooter>
			<Grid item xs={6}>
				<Stack spacing={2}>
					<Typography>
						<Link
							target="_blank"
							rel="noopener noreferrer"
							href="https://marketplace.visualstudio.com/items?itemName=damonsk.vscode-wardley-maps"
						>
							<img
								alt="Download Visual Studio Code Extension"
								src="https://img.shields.io/visual-studio-marketplace/v/damonsk.vscode-wardley-maps?style=flat&amp;label=Download Visual%20Studio%20Code%20Extension&amp;logo=visual-studio-code"
							/>
						</Link>
					</Typography>
					<Typography>
						<svg
							className="gh-icon"
							height="24"
							viewBox="0 0 19 19"
							version="1.1"
							width="24"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
							></path>
						</svg>{' '}
						<Link
							href="https://github.com/damonsk/onlinewardleymaps"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							https://github.com/damonsk/onlinewardleymaps
						</Link>
					</Typography>
					<Typography>
						<svg
							className="gh-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
						>
							<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
						</svg>{' '}
						<Link
							href="https://twitter.com/mapsascode"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							@MapsAsCode
						</Link>
					</Typography>
					<Typography>
						Wardley Mapping courtesy of Simon Wardley, CC BY-SA 4.0. To learn
						more, see{' '}
						<Link
							target="blank"
							href="https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec"
						>
							Simon&apos;s book
						</Link>
						.
					</Typography>
				</Stack>
			</Grid>
			<Grid item xs={6} sx={{ textAlign: 'right' }}>
				<Typography>
					<Link
						href="https://www.patreon.com/mapsascode"
						rel="noreferrer noopener"
						target="_blank"
					>
						<img
							alt="Patreon Button"
							height="38"
							src="/become_a_patron_button.png"
							width="162"
						/>
					</Link>
				</Typography>
				<Typography>
					Developed by{' '}
					<Link
						href="https://www.linkedin.com/in/skels/"
						target="_blank" //eslint-disable-line react/jsx-no-target-blank
						rel="noopener"
					>
						Damon S.
					</Link>
				</Typography>
			</Grid>
		</StyledFooter>
	);
}

export default Footer;
