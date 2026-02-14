import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import {styled} from '@mui/material/styles';
import React, {FunctionComponent, useEffect, useRef} from 'react';
import {useI18n} from '../../hooks/useI18n';
import {MapIteration} from '../../repository/OwnApiWardleyMap';

export interface NewMapIterationsProps {
    mapIterations: MapIteration[];
    currentIteration: number;
    setMapIterations: React.Dispatch<React.SetStateAction<MapIteration[]>>;
    setMapText: React.Dispatch<React.SetStateAction<string>>;
    setCurrentIteration: React.Dispatch<React.SetStateAction<number>>;
    addIteration: () => void;
}

export const NewMapIterations: FunctionComponent<NewMapIterationsProps> = ({
    mapIterations,
    setMapText,
    addIteration,
    setMapIterations,
    setCurrentIteration,
    currentIteration,
}) => {
    const {t, originalT, currentLanguage} = useI18n();

    const StyledArea = styled(Box)(({theme}) => ({
        width: '100%',
        boxShadow: theme.shadows[4],
        marginBottom: '2px',
    }));

    const [openRename, setOpenRename] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [value, setValue] = React.useState('');
    const renameInput = useRef<HTMLInputElement | null>(null);

    const handleClickOpen = () => {
        if (currentIteration >= 0 && currentIteration < mapIterations.length) {
            setOpenRename(true);
            setValue(mapIterations[currentIteration].name);
        }
    };

    const handleClickOpenDelete = () => {
        if (currentIteration >= 0 && currentIteration < mapIterations.length) {
            setOpenDelete(true);
            setValue(mapIterations[currentIteration].name);
        }
    };

    const handleClose = (beforeAction?: () => void | null) => {
        if (beforeAction) beforeAction();
        setOpenRename(false);
    };

    const handleCloseDelete = (beforeAction?: () => void | null) => {
        if (beforeAction) beforeAction();
        setOpenDelete(false);
    };

    const updateIterationName = () => {
        const newList = [...mapIterations];
        newList[currentIteration].name = renameInput.current ? renameInput.current.value : '';
        setMapIterations(newList);
    };

    const deleteIterationClick = function () {
        const newList = [...mapIterations];
        newList.splice(currentIteration, 1);
        if (currentIteration > -1) {
            if (newList.length === 0) {
                setCurrentIteration(-1);
            } else if (currentIteration > newList.length - 1 || currentIteration === newList.length) {
                setCurrentIteration(newList.length - 1);
            } else if (currentIteration <= newList.length - 1) {
                setCurrentIteration(0);
            } else {
                setCurrentIteration(currentIteration - 1);
            }
        }
        setMapIterations(newList);
    };

    const addIterationClick = function () {
        addIteration();
        if (currentIteration === -1) {
            setCurrentIteration(0);
        }
    };

    const totalSteps = () => {
        return mapIterations.length;
    };

    const isLastStep = () => {
        return currentIteration === totalSteps() - 1;
    };

    const handleNext = () => {
        const newActiveStep = isLastStep() ? -1 : currentIteration + 1;
        setCurrentIteration(newActiveStep);
    };

    const handleBack = () => {
        setCurrentIteration(prevActiveStep => prevActiveStep - 1);
    };

    const handleStep = (step: number) => () => {
        setCurrentIteration(step);
    };

    useEffect(() => {
        if (currentIteration > -1) {
            setMapText(mapIterations[currentIteration].mapText);
        }
    }, [currentIteration, mapIterations, setMapText]);

    // useEffect(() => {
    //     // console.log('mapIterations', mapIterations);
    // }, [mapIterations]);

    return (
        <StyledArea key={`iterations-${currentLanguage}`}>
            <Stepper nonLinear activeStep={currentIteration}>
                {Array.isArray(mapIterations) &&
                    mapIterations.map((iteration, index) => (
                        <Step key={index}>
                            <StepButton color="inherit" onClick={handleStep(index)}>
                                {iteration.name}
                            </StepButton>
                        </Step>
                    ))}
            </Stepper>
            <div>
                <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                    <Button disabled={currentIteration <= 0} onClick={handleBack} sx={{mr: 1}} size="small">
                        <KeyboardArrowLeft /> {t('common.back', 'Back')}
                    </Button>
                    <Box sx={{flex: '1 1 auto'}} />

                    {mapIterations.length > 0 && currentIteration >= 0 && currentIteration < mapIterations.length && (
                        <Button size="small" onClick={handleClickOpenDelete}>
                            {t('common.delete', 'Delete')} <DeleteIcon />
                        </Button>
                    )}
                    {mapIterations.length > 0 && currentIteration >= 0 && currentIteration < mapIterations.length && (
                        <Button size="small" onClick={handleClickOpen}>
                            {t('common.rename', 'Rename')} <EditIcon />
                        </Button>
                    )}
                    <Button size="small" onClick={addIterationClick}>
                        {t('common.add', 'Add')} <AddCircleIcon />
                    </Button>
                    <Box sx={{flex: '1 1 auto'}} />
                    <Button
                        size="small"
                        onClick={handleNext}
                        sx={{mr: 1}}
                        disabled={mapIterations.length === 0 || currentIteration === mapIterations.length - 1}>
                        {t('common.next', 'Next')} <KeyboardArrowRight />
                    </Button>
                </Box>
            </div>
            <Dialog open={openRename} onClose={() => handleClose()}>
                <DialogTitle>{t('common.rename', 'Rename')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('iterations.renamePrompt', 'Enter a new name for the current iteration.')}</DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t('iterations.iterationName', 'Iteration Name')}
                        type="text"
                        fullWidth
                        variant="standard"
                        defaultValue={value}
                        inputRef={renameInput}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose()}>{t('common.cancel', 'Cancel')}</Button>
                    <Button onClick={() => handleClose(() => updateIterationName())}>{t('common.update', 'Update')}</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDelete}
                onClose={() => handleCloseDelete()}
                aria-labelledby="alert-dialog-title-delete"
                aria-describedby="alert-dialog-description-delete">
                <DialogTitle id="alert-dialog-title-delete">{t('dialogs.areYouSure', 'Are you sure?')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('iterations.deleteConfirmation', `Are you sure you want to delete iteration '${value}'? This cannot be undone.`)}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCloseDelete(() => deleteIterationClick())}>{t('common.delete', 'Delete')}</Button>
                    <Button onClick={() => handleCloseDelete()} autoFocus>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledArea>
    );
};
