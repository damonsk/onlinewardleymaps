import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link as MuiLink} from '@mui/material';
import React from 'react';
import {useI18n} from '../../hooks/useI18n';

interface AppUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AppUpdateDialog: React.FC<AppUpdateDialogProps> = ({isOpen, onClose}) => {
    const {t} = useI18n();
    const june2026Items = [
        t(
            'updates.june2026.items.1',
            'Fixed that bug where undo/redo would get out of sync with the actual map state, leading to unexpected behavior.',
        ),
        t(
            'updates.june2026.items.2',
            'Fixed that bug where the toolbar would not position correclty in the snap area when in presentation mode.',
        ),
        t(
            'updates.june2026.items.3',
            'Updated to latest major version of key dependencies.',
        ),
    ];
    const may2026Items = [
        t(
            'updates.may2026.items.1',
            'PR #309 adds map-axis controls for evolution and value chain visibility, including the ability to hide either axis from the DSL.',
        ),
        t(
            'updates.may2026.items.2',
            '`evolution --hide` now supports inline custom stage labels and empty stages, and `valuechain --hide` accepts trailing context.',
        ),
        t(
            'updates.may2026.items.3',
            'The canvas right-click editor has been expanded and renamed from “Edit Evolution Stages” to “Edit Map Axis”, with toggles for both axes.',
        ),
        t(
            'updates.may2026.items.4',
            'Linking now supports pipeline child components, including child-to-child links, with corrected rendering and preview alignment.',
        ),
        t(
            'updates.may2026.items.5',
            'Export as Mermaid and Copy as Mermaid are now available from the export menu, using Mermaid Wardley syntax.',
        ),
        t(
            'updates.may2026.items.6',
            'Import from Mermaid is now available from the menu, converting Mermaid Wardley syntax back into OWM map text (#318).',
        ),
    ];
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
        t('updates.feb2026.items.14', 'Fixed annotation number centering for large values in annotation circles (#129).'),
        t('updates.feb2026.items.15', 'Fixed map title inline edit save/cancel controls being partially hidden by the canvas in Chrome (#272).'),
    ];
    const sections = [
        {key: 'june2026', title: t('updates.june2026.title', 'June 2026 update highlights:'), items: june2026Items},
        {key: 'may2026', title: t('updates.may2026.title', 'May 2026 update highlights:'), items: may2026Items},
        {key: 'feb2026', title: t('updates.feb2026.title', 'February 2026 update highlights:'), items: feb2026Items},
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="app-update-dialog-title">
            <DialogTitle id="app-update-dialog-title">{t('updates.title', "What's New 🎉")}</DialogTitle>
            <DialogContent dividers sx={{maxHeight: '70vh', overflowY: 'auto'}}>
                {sections.map((section, index) => (
                    <React.Fragment key={section.key}>
                        {index > 0 && <DialogContentText sx={{mt: 3}} />}
                        <DialogContentText>{section.title}</DialogContentText>
                        <ul style={{marginTop: 8, paddingLeft: 20}}>
                            {section.items.map(item => (
                                <li key={`${section.key}-${item}`}>
                                    <DialogContentText component="span">{item}</DialogContentText>
                                </li>
                            ))}
                        </ul>
                    </React.Fragment>
                ))}
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
