import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link as MuiLink} from '@mui/material';
import React from 'react';
import {useI18n} from '../../hooks/useI18n';

interface AppUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AppUpdateDialog: React.FC<AppUpdateDialogProps> = ({isOpen, onClose}) => {
    const {t} = useI18n();
    const feb2026Items = [
        t('updates.feb2026.items.1', 'Added full WYSIWYG editing for major map elements.'),
        t('updates.feb2026.items.2', 'Expanded keyboard shortcuts, including improved linking with L.'),
        t('updates.feb2026.items.3', 'Right-click actions for delete, inertia add/remove, evolve, and map settings.'),
        t('updates.feb2026.items.4', 'Select links and press Delete/Backspace, or right-click links to delete.'),
        t('updates.feb2026.items.5', 'Hovering components now highlights Flow of Value lines in blue.'),
        t('updates.feb2026.items.6', 'Inline editing upgraded: double-click or Enter, save with Ctrl+Enter or OK, cancel with X.'),
        t('updates.feb2026.items.7', 'Multi-line component names and notes are now fully supported (#127).'),
        t('updates.feb2026.items.8', 'Toolbar improvements: dock support, hide/show toggle, and better preview positioning.'),
        t('updates.feb2026.items.9', 'Map title, anchors, annotations, and link context text support inline editing.'),
        t('updates.feb2026.items.10', 'Cross-browser fixes for Safari and Chrome inline editor behavior.'),
        t('updates.feb2026.items.11', 'Market and Ecosystem linking pulse indicator sizing improved.'),
        t('updates.feb2026.items.12', 'Link relationship syntax highlighting now supports slash names (#176).'),
        t('updates.feb2026.items.13', 'General bug fixes and stability improvements across editing, linking, and toolbar interactions.'),
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="app-update-dialog-title">
            <DialogTitle id="app-update-dialog-title">{t('updates.title', "What's New 🎉")}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('updates.feb2026.title', 'February 2026 update highlights:')}
                </DialogContentText>
                <ul style={{marginTop: 8, paddingLeft: 20}}>
                    {feb2026Items.map(item => (
                        <li key={item}>
                            <DialogContentText component="span">{item}</DialogContentText>
                        </li>
                    ))}
                </ul>
                <DialogContentText sx={{mt: 2}}>
                    {t('updates.feb2026.contactPrefix', 'Reach out on')}{' '}
                    <MuiLink href="https://linkedin.com/in/skels" target="_blank" rel="noopener noreferrer">
                        linkedin.com/in/skels
                    </MuiLink>{' '}
                    {t('updates.feb2026.contactOr', 'or on')}{' '}
                    <MuiLink href="https://github.com/damonsk/onlinewardleymaps" target="_blank" rel="noopener noreferrer">
                        github.com/damonsk/onlinewardleymaps
                    </MuiLink>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    {t('updates.dismiss', 'Got it')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
