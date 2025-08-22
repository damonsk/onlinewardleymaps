import {useCallback, useState} from 'react';

export interface UserFeedback {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
}

export interface UserFeedbackActions {
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    hideUserFeedback: () => void;
    setUserFeedback: React.Dispatch<React.SetStateAction<UserFeedback>>;
}

export const useUserFeedback = (): {
    userFeedback: UserFeedback;
} & UserFeedbackActions => {
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

        // Auto-hide after appropriate delay
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
        setUserFeedback,
    };
};
