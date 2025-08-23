import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useI18n} from '../../hooks/useI18n';

interface MapSizeDialogProps {
    isOpen: boolean;
    currentSize: {width: number; height: number} | null;
    onConfirm: (size: {width: number; height: number}) => void;
    onCancel: () => void;
}

export const MapSizeDialog: React.FC<MapSizeDialogProps> = ({isOpen, currentSize, onConfirm, onCancel}) => {
    const {t} = useI18n();
    const [width, setWidth] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [widthError, setWidthError] = useState<string>('');
    const [heightError, setHeightError] = useState<string>('');

    // Pre-populate dialog with current size when opened
    useEffect(() => {
        if (isOpen) {
            const defaultWidth = currentSize?.width || 800;
            const defaultHeight = currentSize?.height || 600;
            setWidth(defaultWidth.toString());
            setHeight(defaultHeight.toString());
            setWidthError('');
            setHeightError('');
        }
    }, [isOpen, currentSize]);

    const validateSize = (value: string, fieldName: string): string => {
        if (!value.trim()) {
            return `${fieldName} is required`;
        }

        const numValue = parseInt(value, 10);

        if (isNaN(numValue) || !Number.isInteger(numValue)) {
            return `${fieldName} must be a whole number`;
        }

        if (numValue < 100) {
            return `${fieldName} must be at least 100`;
        }

        if (numValue > 5000) {
            return `${fieldName} must be no more than 5000`;
        }

        return '';
    };

    const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setWidth(value);
        setWidthError(validateSize(value, 'Width'));
    };

    const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setHeight(value);
        setHeightError(validateSize(value, 'Height'));
    };

    const handleConfirm = () => {
        const widthValidation = validateSize(width, 'Width');
        const heightValidation = validateSize(height, 'Height');

        setWidthError(widthValidation);
        setHeightError(heightValidation);

        if (!widthValidation && !heightValidation) {
            onConfirm({
                width: parseInt(width, 10),
                height: parseInt(height, 10),
            });
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !widthError && !heightError && width && height) {
            handleConfirm();
        } else if (event.key === 'Escape') {
            handleCancel();
        }
    };

    const isValid = !widthError && !heightError && width.trim() && height.trim();

    return (
        <Dialog
            open={isOpen}
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            aria-labelledby="map-size-dialog-title"
            onKeyDown={handleKeyDown}>
            <DialogTitle id="map-size-dialog-title">{t('dialogs.setMapSize', 'Set Map Size')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                    {t('dialogs.mapSizeDescription', 'Set the dimensions for your map canvas. Values must be between 100 and 5000 pixels.')}
                </Typography>
                <Box sx={{display: 'flex', gap: 2, mt: 1}}>
                    <TextField
                        autoFocus
                        label={t('dialogs.width', 'Width')}
                        type="number"
                        value={width}
                        onChange={handleWidthChange}
                        error={!!widthError}
                        helperText={widthError}
                        fullWidth
                        inputProps={{
                            min: 100,
                            max: 5000,
                            step: 1,
                        }}
                    />
                    <TextField
                        label={t('dialogs.height', 'Height')}
                        type="number"
                        value={height}
                        onChange={handleHeightChange}
                        error={!!heightError}
                        helperText={heightError}
                        fullWidth
                        inputProps={{
                            min: 100,
                            max: 5000,
                            step: 1,
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>{t('common.cancel', 'Cancel')}</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={!isValid}>
                    {t('common.confirm', 'Confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MapSizeDialog;
