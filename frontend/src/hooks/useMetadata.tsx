import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useEffect} from 'react';
import {useI18n} from './useI18n';

interface DynamicMetadataProps {
    title?: string;
    description?: string;
}

/**
 * Component to manage dynamic metadata based on language and other state
 */
export const DynamicMetadata: React.FC<DynamicMetadataProps> = ({title, description}) => {
    const {t, currentLanguage} = useI18n();
    const router = useRouter();

    useEffect(() => {
        // Update document language attribute when language changes
        if (typeof document !== 'undefined') {
            document.documentElement.lang = currentLanguage;
        }
    }, [currentLanguage]);

    const pageTitle = title || `${t('app.title', 'Wardley Maps')} - ${t('app.name', 'Online Wardley Maps')}`;
    const pageDescription = description || t('app.description', 'Create and share Wardley Maps online');

    return (
        <Head>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:locale" content={currentLanguage} />

            {/* Canonical URL with current language */}
            <link rel="canonical" href={`https://onlinewardleymaps.com${router.asPath}`} />
        </Head>
    );
};
