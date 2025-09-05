import {Box, Grid, Link, Stack, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import React from 'react';
import {useI18n} from '../../hooks/useI18n';

const StyledFooter = styled((props: {children?: React.ReactNode}) => <Grid container padding={4} {...props} />)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.background.paper,
    borderTop: `2px solid ${theme.palette.divider}`,
    '& .gh-icon': {
        fill: theme.palette.mode === 'light' ? 'black' : 'white',
        verticalAlign: 'bottom',
    },
    '& .x-icon': {
        fill: theme.palette.mode === 'light' ? 'black' : 'white',
    },
}));

const Footer: React.FC = () => {
    const {t} = useI18n();

    return (
        <StyledFooter>
            <Box sx={{width: '50%'}}>
                <Stack spacing={2}>
                    <Typography>
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://marketplace.visualstudio.com/items?itemName=damonsk.vscode-wardley-maps">
                            <img
                                alt={t('footer.downloadExtension')}
                                src="https://img.shields.io/visual-studio-marketplace/v/damonsk.vscode-wardley-maps?style=flat&amp;label=Download Visual%20Studio%20Code%20Extension&amp;logo=visual-studio-code"
                            />
                        </Link>
                    </Typography>
                    <Typography>
                        <svg className="gh-icon" height="24" viewBox="0 0 19 19" version="1.1" width="24" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>{' '}
                        <Link href="https://github.com/damonsk/onlinewardleymaps" target="_blank" rel="noopener noreferrer">
                            https://github.com/damonsk/onlinewardleymaps
                        </Link>
                    </Typography>{' '}
                    <Typography>
                        <Link href="https://x.com/mapsascode" target="_blank" rel="noopener noreferrer">
                            <svg
                                className="x-icon"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{verticalAlign: 'middle', marginRight: '8px'}}>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            {t('footer.twitter', 'MapsAsCode')}
                        </Link>
                    </Typography>
                    <Typography>
                        {t('footer.wardleyMapping')}{' '}
                        <Link target="blank" href="https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec">
                            {t('footer.wardleyMappingLink')}
                        </Link>
                        .
                    </Typography>
                </Stack>
            </Box>
            <Box sx={{width: '50%', textAlign: 'right'}}>
                <Typography>
                    <Link href="https://www.patreon.com/mapsascode" rel="noreferrer noopener" target="_blank">
                        <img alt={t('footer.patreonAlt', 'Become a Patron')} height="38" src="/become_a_patron_button.png" width="162" />
                    </Link>
                </Typography>
                <Typography>
                    {t('footer.createdBy', 'Created by')}{' '}
                    <Link href="https://www.linkedin.com/in/skels/" target="_blank" rel="noopener noreferrer">
                        Damon Skelhorn
                    </Link>
                </Typography>
            </Box>
        </StyledFooter>
    );
};

export default Footer;
