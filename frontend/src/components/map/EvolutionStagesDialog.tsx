import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useI18n} from '../../hooks/useI18n';

interface EvolutionStagesDialogProps {
    isOpen: boolean;
    currentStages: {stage1: string; stage2: string; stage3: string; stage4: string} | null;
    onConfirm: (stages: {stage1: string; stage2: string; stage3: string; stage4: string}) => void;
    onCancel: () => void;
}

export const EvolutionStagesDialog: React.FC<EvolutionStagesDialogProps> = ({isOpen, currentStages, onConfirm, onCancel}) => {
    const {t} = useI18n();
    const [stage1, setStage1] = useState<string>('');
    const [stage2, setStage2] = useState<string>('');
    const [stage3, setStage3] = useState<string>('');
    const [stage4, setStage4] = useState<string>('');
    const [stage1Error, setStage1Error] = useState<string>('');
    const [stage2Error, setStage2Error] = useState<string>('');
    const [stage3Error, setStage3Error] = useState<string>('');
    const [stage4Error, setStage4Error] = useState<string>('');

    // Default evolution stages
    const defaultStages = {
        stage1: 'Genesis',
        stage2: 'Custom Built',
        stage3: 'Product',
        stage4: 'Commodity',
    };

    // Pre-populate dialog with current stages or defaults when opened
    useEffect(() => {
        if (isOpen) {
            const stages = currentStages || defaultStages;
            setStage1(stages.stage1);
            setStage2(stages.stage2);
            setStage3(stages.stage3);
            setStage4(stages.stage4);
            setStage1Error('');
            setStage2Error('');
            setStage3Error('');
            setStage4Error('');
        }
    }, [isOpen, currentStages]);

    const validateStageName = (value: string, stageNumber: number): string => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return `Stage ${stageNumber} name is required`;
        }

        if (trimmedValue.length > 50) {
            return `Stage ${stageNumber} name must be 50 characters or less`;
        }

        return '';
    };

    const handleStageChange = (
        stageNumber: 1 | 2 | 3 | 4,
        value: string,
        setter: React.Dispatch<React.SetStateAction<string>>,
        errorSetter: React.Dispatch<React.SetStateAction<string>>,
    ) => {
        setter(value);
        errorSetter(validateStageName(value, stageNumber));
    };

    const handleConfirm = () => {
        const stage1Validation = validateStageName(stage1, 1);
        const stage2Validation = validateStageName(stage2, 2);
        const stage3Validation = validateStageName(stage3, 3);
        const stage4Validation = validateStageName(stage4, 4);

        setStage1Error(stage1Validation);
        setStage2Error(stage2Validation);
        setStage3Error(stage3Validation);
        setStage4Error(stage4Validation);

        if (!stage1Validation && !stage2Validation && !stage3Validation && !stage4Validation) {
            onConfirm({
                stage1: stage1.trim(),
                stage2: stage2.trim(),
                stage3: stage3.trim(),
                stage4: stage4.trim(),
            });
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && isValid) {
            handleConfirm();
        } else if (event.key === 'Escape') {
            handleCancel();
        }
    };

    const isValid =
        !stage1Error && !stage2Error && !stage3Error && !stage4Error && stage1.trim() && stage2.trim() && stage3.trim() && stage4.trim();

    return (
        <Dialog
            open={isOpen}
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            aria-labelledby="evolution-stages-dialog-title"
            onKeyDown={handleKeyDown}>
            <DialogTitle id="evolution-stages-dialog-title">{t('dialogs.editEvolutionStages', 'Edit Evolution Stages')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
                    {t(
                        'dialogs.evolutionStagesDescription',
                        'Customize the names of the four evolution stages. These will appear as labels on the evolution axis of your map.',
                    )}
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
                    <TextField
                        autoFocus
                        label={t('dialogs.stage1', 'Stage 1 (Genesis)')}
                        value={stage1}
                        onChange={e => handleStageChange(1, e.target.value, setStage1, setStage1Error)}
                        error={!!stage1Error}
                        helperText={stage1Error}
                        fullWidth
                        inputProps={{
                            maxLength: 50,
                        }}
                    />
                    <TextField
                        label={t('dialogs.stage2', 'Stage 2 (Custom Built)')}
                        value={stage2}
                        onChange={e => handleStageChange(2, e.target.value, setStage2, setStage2Error)}
                        error={!!stage2Error}
                        helperText={stage2Error}
                        fullWidth
                        inputProps={{
                            maxLength: 50,
                        }}
                    />
                    <TextField
                        label={t('dialogs.stage3', 'Stage 3 (Product)')}
                        value={stage3}
                        onChange={e => handleStageChange(3, e.target.value, setStage3, setStage3Error)}
                        error={!!stage3Error}
                        helperText={stage3Error}
                        fullWidth
                        inputProps={{
                            maxLength: 50,
                        }}
                    />
                    <TextField
                        label={t('dialogs.stage4', 'Stage 4 (Commodity)')}
                        value={stage4}
                        onChange={e => handleStageChange(4, e.target.value, setStage4, setStage4Error)}
                        error={!!stage4Error}
                        helperText={stage4Error}
                        fullWidth
                        inputProps={{
                            maxLength: 50,
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

export default EvolutionStagesDialog;
