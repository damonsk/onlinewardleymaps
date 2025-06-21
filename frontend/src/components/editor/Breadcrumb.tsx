import {Grid, Link, Typography} from '@mui/material';
import React from 'react';
import {useI18n} from '../../hooks/useI18n';

export interface BreadcrumbProps {
    currentUrl: string;
}

export const Breadcrumb: React.FunctionComponent<BreadcrumbProps> = ({currentUrl}) => {
    const {t} = useI18n();

    return (
        <Grid container spacing={2} padding={1}>
            <Grid item xs={6}>
                <Typography>
                    {t('map.yourMap', 'Your Map')}:{' '}
                    <Link href={currentUrl.indexOf('#') === -1 ? '#' : currentUrl} id="url" data-testid="breadcrumb-list-item-your-map">
                        {currentUrl.indexOf('#') === -1 ? `(${t('map.unsaved', 'unsaved')})` : currentUrl}
                    </Link>
                </Typography>
            </Grid>
        </Grid>
    );
};
