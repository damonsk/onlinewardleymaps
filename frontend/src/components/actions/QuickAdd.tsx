import React, {ChangeEvent, ChangeEventHandler, memo, useCallback, useEffect, useState} from 'react';
import {
    BuildMethodIcon,
    BuyMethodIcon,
    ComponentIcon,
    EcosystemIcon,
    GenericNoteIcon,
    InertiaIcon,
    MarketIcon,
    OutSourceMethodIcon,
} from '../symbols/icons';

import {TextField} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {ThemeProvider} from '@mui/material/styles';
import {MapTheme} from '../../constants/mapstyles';
import {useI18n} from '../../hooks/useI18n';
import {lightTheme} from '../../theme/index';

export interface QuickAddProps {
    newComponentContext: {x: string; y: string} | null;
    mutateMapText: (newText: string) => void;
    setNewComponentContext: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;
    mapText: string;
    mapStyleDefs: MapTheme;
}

export const QuickAdd: React.FunctionComponent<QuickAddProps> = ({
    newComponentContext,
    mutateMapText,
    setNewComponentContext,
    mapText,
    mapStyleDefs,
}) => {
    // Get translation function
    const {t} = useI18n();

    const icons = [
        {
            Icon: ComponentIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}]`,
        },
        {
            Icon: InertiaIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}] inertia`,
        },
        {
            Icon: MarketIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}] (market)`,
        },
        {
            Icon: EcosystemIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}] (ecosystem)`,
        },
        {
            Icon: BuyMethodIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}] (buy)`,
        },
        {
            Icon: BuildMethodIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}] (build)`,
        },
        {
            Icon: OutSourceMethodIcon,
            template: (val: string, y: string, x: string) => `component ${val} [${y}, ${x}] (outsource)`,
        },
        {
            Icon: GenericNoteIcon,
            template: (val: string, y: string, x: string) => `note ${val} [${y}, ${x}]`,
        },
    ];
    const [showAdd, setShowAdd] = useState(false);
    const [typeToUse, setTypeToUse] = useState(0);
    const [value, setValue] = React.useState('');
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleChaneOfComponent = (event: SelectChangeEvent<number>) => {
        setTypeToUse(parseInt(event.target.value.toString()));
    };
    const cancelShowAdd = useCallback(() => {
        setShowAdd(false);
        setNewComponentContext(null);
    }, [setShowAdd, setNewComponentContext]);

    useEffect(() => {
        const handleEscape = (k: KeyboardEvent) => {
            if (k.key === 'Escape') {
                document.removeEventListener('keyup', handleEscape);
                cancelShowAdd();
            }
        };

        if (newComponentContext) {
            setShowAdd(true);
            document.addEventListener('keyup', handleEscape);
        }
        return function cleanup() {
            document.removeEventListener('keyup', handleEscape);
        };
    }, [newComponentContext, cancelShowAdd]);

    function addNewComponent() {
        if (value.trim().length === 0 || !newComponentContext) return;
        setShowAdd(false);

        // Use the coordinates directly - they're already in the correct format
        const componentString = icons[typeToUse].template(value.trim(), newComponentContext.y, newComponentContext.x);

        // Add the new component to the map text
        mutateMapText(mapText + `\r\n${componentString}`);
        setValue('');
    }

    return (
        <>
            <ThemeProvider theme={lightTheme}>
                <Dialog
                    open={showAdd}
                    onClose={cancelShowAdd}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{t('components.quickAdd', 'Quick Add')}</DialogTitle>
                    <DialogContent>
                        <FormControl
                            sx={{
                                m: 1,
                                minWidth: 80,
                                '.MuiInputBase-root:before': {
                                    border: '0',
                                },
                            }}>
                            <InputLabel id="type-autowidth-label">{t('components.type', 'Type')}</InputLabel>
                            <Select
                                labelId="type-autowidth-label"
                                id="demo-simple-select-autowidth"
                                value={typeToUse}
                                onChange={handleChaneOfComponent}
                                label={t('components.type', 'Type')}
                                variant="standard">
                                {icons.map((available, idx) => {
                                    const {Icon} = available;
                                    return (
                                        <MenuItem key={idx} value={idx}>
                                            <Icon
                                                mapStyleDefs={mapStyleDefs}
                                                hideLabel={false}
                                                id={''}
                                                evolved={false}
                                                text={''}
                                                onClick={() => {}}
                                            />
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <FormControl sx={{m: 1, minWidth: 80}}>
                            <TextField
                                id="outlined-multiline-flexible"
                                label={t('components.text', 'Text')}
                                value={value}
                                onChange={handleChange}
                                autoFocus={true}
                                variant="standard"
                                sx={{
                                    '& .MuiInput-input': {
                                        height: '40px',
                                    },
                                }}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') addNewComponent();
                                }}
                            />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelShowAdd}>{t('common.cancel', 'Cancel')}</Button>
                        <Button onClick={addNewComponent}>{t('common.add', 'Add')}</Button>
                    </DialogActions>
                </Dialog>
            </ThemeProvider>
        </>
    );
};

export default memo(QuickAdd);
