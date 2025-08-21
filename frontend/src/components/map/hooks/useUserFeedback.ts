import {useCallback, useState} from 'react';

export interface UserFeedback {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
}

/**
 * Custom hook to manage user feedback notifications
 * Extracted from MapView to reduce complexity
 */
export const useUserFeedback = () => {
    const [userFeedback, setUserFeedback] = useState<UserFeedback>({
        message: '',
        type: 'info',
        visible: false,
    });

    const showUserFeedback = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setUserFeedback({
            message,
            type,
            visible: true,
        });

        // Auto-hide after 5 seconds for success/info, 8 seconds for warnings/errors
        const hideDelay = type === 'error' || type === 'warning' ? 8000 : 5000;
        setTimeout(() => {
            setUserFeedback(prev => ({...prev, visible: false}));
        }, hideDelay);
    }, []);

    const hideUserFeedback = useCallback(() => {
        setUserFeedback(prev => ({...prev, visible: false}));
    }, []);

    return {
        userFeedback,
        showUserFeedback,
        hideUserFeedback,
    };
};
