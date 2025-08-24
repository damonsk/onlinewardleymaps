import {Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import React, {ReactNode} from 'react';
import {useI18n} from '../../../hooks/useI18n';
import {MapIteration} from '../../../repository/OwnApiWardleyMap';
import {ResizableSplitPane} from '../../common/ResizableSplitPane';
import {Breadcrumb} from '../../editor/Breadcrumb';
import {NewMapIterations} from '../../editor/MapIterations';
import {LeftNavigation} from '../../page/LeftNavigation';
import NewHeader from '../../page/NewHeader';
import {UsageInfo} from '../../page/UseageInfo';

interface MapLayoutProps {
    // Navigation props
    toggleMenu: () => void;
    menuVisible: boolean;
    submenu: any[];
    toggleTheme: () => void;
    isLightTheme: boolean;
    hideNav: boolean;
    shouldHideNav: () => void;

    // Header props
    mapOnlyView: boolean;
    setMapOnlyView: React.Dispatch<React.SetStateAction<boolean>>;
    currentUrl: string;
    saveOutstanding: boolean;
    mutateMapText: (text: string) => void;
    newMapClick: (strategy: string) => void;
    saveMapClick: () => Promise<void>;
    downloadMapImage: () => void;
    showLineNumbers: boolean;
    setShowLineNumbers: React.Dispatch<React.SetStateAction<boolean>>;
    showLinkedEvolved: boolean;
    setShowLinkedEvolved: React.Dispatch<React.SetStateAction<boolean>>;
    downloadMapAsSVG: () => void;

    // Iterations props
    mapIterations: MapIteration[];
    currentIteration: number;
    setMapIterations: React.Dispatch<React.SetStateAction<MapIteration[]>>;
    setMapText: React.Dispatch<React.SetStateAction<string>>;
    addIteration: () => void;
    setCurrentIteration: React.Dispatch<React.SetStateAction<number>>;

    // Layout content
    leftPanel: ReactNode;
    rightPanel: ReactNode;

    // Usage dialog props
    showUsage: boolean;
    setShowUsage: (show: boolean) => void;
    mapStyleDefs: any;
    mapText: string;
}

export const MapLayout: React.FC<MapLayoutProps> = ({
    toggleMenu,
    menuVisible,
    submenu,
    toggleTheme,
    isLightTheme,
    hideNav,
    shouldHideNav,
    mapOnlyView,
    setMapOnlyView,
    currentUrl,
    saveOutstanding,
    mutateMapText,
    newMapClick,
    saveMapClick,
    downloadMapImage,
    showLineNumbers,
    setShowLineNumbers,
    showLinkedEvolved,
    setShowLinkedEvolved,
    downloadMapAsSVG,
    mapIterations,
    currentIteration,
    setMapIterations,
    setMapText,
    addIteration,
    setCurrentIteration,
    leftPanel,
    rightPanel,
    showUsage,
    setShowUsage,
    mapStyleDefs,
    mapText,
}) => {
    const {t} = useI18n();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
            }}>
            <LeftNavigation
                toggleMenu={toggleMenu}
                menuVisible={menuVisible}
                submenu={submenu}
                toggleTheme={toggleTheme}
                isLightTheme={isLightTheme}
            />

            <Box
                id="top-nav-wrapper"
                sx={{
                    display: hideNav ? 'none' : 'block',
                    flexShrink: 0,
                }}>
                <NewHeader
                    mapOnlyView={mapOnlyView}
                    setMapOnlyView={setMapOnlyView}
                    currentUrl={currentUrl}
                    saveOutstanding={saveOutstanding}
                    mutateMapText={mutateMapText}
                    newMapClick={newMapClick}
                    saveMapClick={saveMapClick}
                    downloadMapImage={downloadMapImage}
                    showLineNumbers={showLineNumbers}
                    setShowLineNumbers={setShowLineNumbers}
                    showLinkedEvolved={showLinkedEvolved}
                    setShowLinkedEvolved={setShowLinkedEvolved}
                    downloadMapAsSVG={downloadMapAsSVG}
                    toggleMenu={toggleMenu}
                />

                <Breadcrumb currentUrl={currentUrl} />

                <NewMapIterations
                    mapIterations={mapIterations}
                    currentIteration={currentIteration}
                    setMapIterations={setMapIterations}
                    setMapText={setMapText}
                    addIteration={addIteration}
                    setCurrentIteration={setCurrentIteration}
                />
            </Box>

            <Box sx={{flexGrow: 1, height: '100%', overflow: 'hidden'}}>
                {mapOnlyView === false ? (
                    <ResizableSplitPane
                        defaultLeftWidth={33}
                        minLeftWidth={20}
                        maxLeftWidth={60}
                        storageKey="wardleyMapEditor_splitPaneWidth"
                        isDarkTheme={!isLightTheme}
                        leftPanel={leftPanel}
                        rightPanel={rightPanel}
                    />
                ) : (
                    rightPanel
                )}
            </Box>

            <Dialog maxWidth={'lg'} open={showUsage} onClose={() => setShowUsage(false)}>
                <DialogTitle>{t('editor.usage', 'Usage')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t(
                            'editor.usageDescription',
                            'Quick reference of all available map elements. You can add an example to your map by clicking the available links.',
                        )}
                    </DialogContentText>
                    <Box marginTop={2}>
                        <UsageInfo mapStyleDefs={mapStyleDefs} mutateMapText={mutateMapText} mapText={mapText} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowUsage(false)}>{t('common.close', 'Close')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
