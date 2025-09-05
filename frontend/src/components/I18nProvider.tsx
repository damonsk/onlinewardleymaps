import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useI18n} from '../hooks/useI18n';

interface I18nProviderProps {
    children: React.ReactNode;
}

/**
 * Wrapper component that ensures i18next is properly initialized
 * before rendering children that depend on translations
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({children}) => {
    const {ready} = useTranslation('common', {useSuspense: false});
    const {t} = useI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render children until both mounted and i18next is ready
    if (!mounted || !ready) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontFamily: 'Arial, sans-serif',
                }}>
                {t('common.loading', 'Loading...')}
            </div>
        );
    }

    return <>{children}</>;
};
