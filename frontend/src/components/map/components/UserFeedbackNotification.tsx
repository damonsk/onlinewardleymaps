import React from 'react';
import {UserFeedback} from '../hooks/useUserFeedback';

interface UserFeedbackNotificationProps {
    userFeedback: UserFeedback;
    setUserFeedback: React.Dispatch<React.SetStateAction<UserFeedback>>;
}

export const UserFeedbackNotification: React.FC<UserFeedbackNotificationProps> = ({userFeedback, setUserFeedback}) => {
    if (!userFeedback.visible) return null;

    const getBackgroundColor = () => {
        switch (userFeedback.type) {
            case 'success':
                return '#d4edda';
            case 'error':
                return '#f8d7da';
            case 'warning':
                return '#fff3cd';
            default:
                return '#d1ecf1';
        }
    };

    const getBorderColor = () => {
        switch (userFeedback.type) {
            case 'success':
                return '#c3e6cb';
            case 'error':
                return '#f5c6cb';
            case 'warning':
                return '#ffeaa7';
            default:
                return '#bee5eb';
        }
    };

    const getTextColor = () => {
        switch (userFeedback.type) {
            case 'success':
                return '#155724';
            case 'error':
                return '#721c24';
            case 'warning':
                return '#856404';
            default:
                return '#0c5460';
        }
    };

    const getIcon = () => {
        switch (userFeedback.type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: '16px',
                    right: '16px',
                    zIndex: 10001,
                    maxWidth: '280px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid',
                    fontSize: '12px',
                    fontWeight: '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    animation: 'slideInFromRight 0.2s ease-out',
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    color: getTextColor(),
                }}
                role="alert"
                aria-live="polite">
                <span style={{fontSize: '16px', marginRight: '4px'}}>{getIcon()}</span>
                <span>{userFeedback.message}</span>
                <button
                    onClick={() => setUserFeedback(prev => ({...prev, visible: false}))}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        padding: '0 4px',
                        color: 'inherit',
                        opacity: 0.7,
                    }}
                    aria-label="Close notification">
                    ×
                </button>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes slideInFromRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};
