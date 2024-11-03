import { Grid, Link, Typography } from '@mui/material';
import React from 'react';

const Breadcrumb = ({ currentUrl }) => {
    return (
        <Grid container spacing={2} padding={1}>
            <Grid item xs={6}>
                <Typography>
                    Your Map:{' '}
                    <Link
                        href={currentUrl.indexOf('#') === -1 ? '#' : currentUrl}
                        id="url"
                        data-testid="breadcrumb-list-item-your-map"
                    >
                        {currentUrl.indexOf('#') === -1
                            ? '(unsaved)'
                            : currentUrl}
                    </Link>
                </Typography>
            </Grid>
        </Grid>
    );
};

export default Breadcrumb;
