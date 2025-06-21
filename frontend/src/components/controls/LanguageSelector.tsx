import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import React from 'react';
import {useI18n} from '../../hooks/useI18n';

interface LanguageSelectorProps {
    size?: 'small' | 'medium';
    variant?: 'outlined' | 'filled' | 'standard';
    className?: string;
}

/**
 * Language selector component for switching between supported locales
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({size = 'small', variant = 'outlined', className}) => {
    const {t, changeLanguage, currentLanguage, supportedLanguages} = useI18n();

    const handleLanguageChange = async (event: SelectChangeEvent<string>) => {
        await changeLanguage(event.target.value);
    };

    // Fallback label in case translation is not loaded
    const label = t('navigation.language', 'Language');

    return (
        <FormControl size={size} variant={variant} className={className} sx={{minWidth: 120}}>
            <InputLabel id="language-selector-label">{label}</InputLabel>
            <Select
                labelId="language-selector-label"
                id="language-selector"
                value={currentLanguage}
                label={label}
                onChange={handleLanguageChange}>
                {supportedLanguages.map(language => (
                    <MenuItem key={language.code} value={language.code}>
                        {language.nativeName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default LanguageSelector;
