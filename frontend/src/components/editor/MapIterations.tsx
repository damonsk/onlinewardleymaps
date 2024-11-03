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
import { styled } from '@mui/material/styles';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import { MapIteration } from '../../repository/OwnApiWardleyMap';

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
    const StyledArea = styled(Box)(({ theme }) => ({
        width: '100%',
        boxShadow: theme.shadows[4],
        marginBottom: '2px',
    }));

    const [openRename, setOpenRename] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [value, setValue] = React.useState('');
    const renameInput = useRef<HTMLInputElement | null>(null);

    const handleClickOpen = () => {
        setOpenRename(true);
        setValue(mapIterations[currentIteration].name);
    };

    const handleClickOpenDelete = () => {
        setOpenDelete(true);
        setValue(mapIterations[currentIteration].name);
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
        newList[currentIteration].name = renameInput.current
            ? renameInput.current.value
            : '';
        setMapIterations(newList);
    };

    const deleteIterationClick = function() {
        const newList = [...mapIterations];
        newList.splice(currentIteration, 1);
        if (currentIteration > -1) {
            if (newList.length === 0) {
                setCurrentIteration(-1);
            } else if (
                currentIteration > newList.length - 1 ||
                currentIteration === newList.length
            ) {
                setCurrentIteration(newList.length - 1);
            } else if (currentIteration <= newList.length - 1) {
                setCurrentIteration(0);
            } else {
                setCurrentIteration(currentIteration - 1);
            }
        }
        setMapIterations(newList);
    };

    const addIterationClick = function() {
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
    }, [currentIteration]);

    // useEffect(() => {
    //     // console.log('mapIterations', mapIterations);
    // }, [mapIterations]);

    return (
        <StyledArea>
            <Stepper nonLinear activeStep={currentIteration}>
                {Array.isArray(mapIterations) &&
                    mapIterations.map((iteration, index) => (
                        <Step key={index}>
                            <StepButton
                                color="inherit"
                                onClick={handleStep(index)}
                            >
                                {iteration.name}
                            </StepButton>
                        </Step>
                    ))}
            </Stepper>
            <div>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                        disabled={currentIteration <= 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                        size="small"
                    >
                        <KeyboardArrowLeft /> Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />

                    {(mapIterations.length > 0 || currentIteration > 0) && (
                        <Button size="small" onClick={handleClickOpenDelete}>
                            Delete <DeleteIcon />
                        </Button>
                    )}
                    {(mapIterations.length > 0 || currentIteration > 0) && (
                        <Button size="small" onClick={handleClickOpen}>
                            Rename <EditIcon />
                        </Button>
                    )}
                    <Button size="small" onClick={addIterationClick}>
                        Add <AddCircleIcon />
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button
                        size="small"
                        onClick={handleNext}
                        sx={{ mr: 1 }}
                        disabled={
                            mapIterations.length === 0 ||
                            currentIteration === mapIterations.length - 1
                        }
                    >
                        Next <KeyboardArrowRight />
                    </Button>
                </Box>
            </div>
            <Dialog open={openRename} onClose={() => handleClose()}>
                <DialogTitle>Rename</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a new name for the current iteration.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Iteration Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        defaultValue={value}
                        inputRef={renameInput}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose()}>Cancel</Button>
                    <Button
                        onClick={() => handleClose(() => updateIterationName())}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDelete}
                onClose={() => handleCloseDelete()}
                aria-labelledby="alert-dialog-title-delete"
                aria-describedby="alert-dialog-description-delete"
            >
                <DialogTitle id="alert-dialog-title-delete">
                    Are you sure?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete iteration &apos;{value}
                        &apos;? This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            handleCloseDelete(() => deleteIterationClick())
                        }
                    >
                        Delete
                    </Button>
                    <Button onClick={() => handleCloseDelete()} autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledArea>
    );
};
