import React, { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listMaps, listPublicMaps } from '../src/graphql/queries';
import DashboardMapItem from '../src/components/DashboardMapItem';
import LeftNavigation from '../src/components/page/LeftNavigation';
import {
    Box,
    Grid,
    Typography,
    Container,
    Alert,
    Link,
    AlertTitle,
} from '@mui/material';
import DashboardHeader from '../src/components/page/DashboardHeader';

const Dashboard = props => {
    const client = generateClient();
    const [privateMaps, setPrivateMaps] = useState([]);
    const [publicMaps, setPublicMaps] = useState([]);
    const [concatenatedMaps, setConcatenatedMaps] = useState([]);
    const {
        toggleMenu,
        menuVisible,
        toggleTheme,
        isLightTheme,
        user,
        setHideAuthModal,
    } = props;

    const struturePublic = useCallback(() => {
        return publicMaps.map(m => {
            return {
                id: m.id,
                isPrivate: false,
                map: m,
            };
        });
    }, [publicMaps]);

    const structurePrivate = useCallback(() => {
        return privateMaps.map(m => {
            return {
                id: m.id,
                isPrivate: true,
                map: m,
            };
        });
    }, [privateMaps]);

    useEffect(() => {
        let maps = structurePrivate().concat(struturePublic());
        console.log('maps', maps);
        const sortedMaps = maps.sort((a, b) =>
            a.map.name < b.map.name ? -1 : a.map.name > b.map.name ? 1 : 0,
        );
        setConcatenatedMaps(sortedMaps);
    }, [structurePrivate, struturePublic]);

    const reload = () => {
        const getPrivateMaps = async () =>
            await client.graphql({
                query: listMaps,
                //authMode: 'AMAZON_COGNITO_USER_POOLS',
                operationName: 'listMaps',
            });
        const getPublicMaps = async () =>
            await client.graphql({
                query: listPublicMaps,
                //authMode: 'AMAZON_COGNITO_USER_POOLS',
                operationName: 'listMaps',
            });
        getPrivateMaps()
            .then(r => {
                console.log('setPrivateMaps', r.data);
                setPrivateMaps(r.data.listMaps.items);
            })
            .catch(e => {
                console.log('error', e);
                setPrivateMaps([]);
            });
        getPublicMaps()
            .then(r => {
                console.log('setPublicMaps', r.data);
                setPublicMaps(r.data.listPublicMaps.items);
            })
            .catch(e => {
                console.log('error', e);
                setPublicMaps([]);
            });
    };

    useEffect(() => {
        try {
            if (user !== undefined && user !== null) {
                reload();
            } else {
                setPrivateMaps([]);
                setPublicMaps([]);
            }
        } catch (e) {
            console.log('error', e);
            setPrivateMaps([]);
            setPublicMaps([]);
        }
    }, [user]);

    return (
        <React.Fragment>
            <LeftNavigation
                toggleMenu={toggleMenu}
                menuVisible={menuVisible}
                toggleTheme={toggleTheme}
                isLightTheme={isLightTheme}
                user={user}
                setHideAuthModal={setHideAuthModal}
            />
            <Box id="top-nav-wrapper">
                <DashboardHeader toggleMenu={toggleMenu} />
            </Box>

            <Container maxWidth="md" mt={2}>
                <Box mt={2} mb={2}>
                    <Typography mb={2} variant="h1">
                        Dashboard
                    </Typography>

                    {user !== null && (
                        <Grid
                            container
                            spacing={{ xs: 2, md: 3 }}
                            columns={{ xs: 4, sm: 8, md: 12 }}
                        >
                            {concatenatedMaps.map((item, index) => (
                                <DashboardMapItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    reload={reload}
                                />
                            ))}
                        </Grid>
                    )}

                    {user === null && (
                        <Alert severity="warning">
                            <AlertTitle>Notice</AlertTitle>
                            Please login to view your dashboard.{' '}
                            <Link
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setHideAuthModal(false)}
                            >
                                <strong>Login or Register</strong>
                            </Link>
                        </Alert>
                    )}
                </Box>
            </Container>
        </React.Fragment>
    );
};

export default Dashboard;
