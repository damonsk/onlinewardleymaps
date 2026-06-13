import {Box, Grid, Link, Stack, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import React from 'react';
import {useI18n} from '../../hooks/useI18n';

const StyledFooter = styled((props: {children?: React.ReactNode}) => <Grid container sx={{p: 4}} {...props} />)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.background.paper,
    borderTop: `2px solid ${theme.palette.divider}`,
    '& .gh-icon': {
        fill: theme.palette.mode === 'light' ? 'black' : 'white',
        verticalAlign: 'bottom',
    },
}));

const Footer: React.FC = () => {
    const {t} = useI18n();

    return (
        <StyledFooter>
            <Box sx={{width: '100%'}}>
                <Stack spacing={2}>
                    <Typography>
                        OnlineWardleyMaps by{' '}
                        <Link href="https://www.linkedin.com/in/skels/" target="_blank" rel="noopener noreferrer">
                            Damon Skelhorn
                        </Link>{' '}
                        · Wardley Maps by{' '}
                        <Link href="https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec" target="_blank" rel="noopener noreferrer">
                            Simon Wardley
                        </Link>{' '}
                        ·{' '}
                        <Link href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                            CC BY-SA
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
                    <Box>
                        <Link href="https://www.patreon.com/mapsascode" rel="noreferrer noopener" target="_blank" sx={{display: 'inline-flex'}}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt={t('footer.patreonAlt', 'Become a Patron')} height="38" src="/become_a_patron_button.png" width="162" />
                        </Link>
                    </Box>
                    
                </Stack>
            </Box>
        </StyledFooter>
    );
};

export default Footer;
