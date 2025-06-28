import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';

export interface ModKeyPressedContextProps {
    isModKeyPressed: boolean;
}

export const ModKeyPressedContext = createContext<ModKeyPressedContextProps | undefined>(undefined);

export function useKeysPressed(allowedKeys: string[] | undefined) {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

    const allowAll = useMemo(() => {
        return !allowedKeys || (Array.isArray(allowedKeys) && allowedKeys.length === 0);
    }, [allowedKeys]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const {key} = event;
            if (allowAll || (allowedKeys && allowedKeys.includes(key))) {
                setPressedKeys(prevKeys => {
                    if (prevKeys.has(key)) return prevKeys; // Avoid unnecessary updates
                    const newKeys = new Set(prevKeys);
                    newKeys.add(key);
                    return newKeys;
                });
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            const {key} = event;
            if (allowAll || (allowedKeys && allowedKeys.includes(key))) {
                setPressedKeys(prevKeys => {
                    if (!prevKeys.has(key)) return prevKeys; // Avoid unnecessary updates
                    const newKeys = new Set(prevKeys);
                    newKeys.delete(key);
                    return newKeys;
                });
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [allowedKeys, allowAll]);

    return pressedKeys;
}

export function useModKeyPressed() {
    const keysPressed = useKeysPressed(['Meta', 'Control']);
    const [isModKeyPressed, setModKeyPressed] = useState(false);

    useEffect(() => {
        const isDarwin = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
        const CTRL_OR_CMD = isDarwin ? 'Meta' : 'Control';
        const pressed = keysPressed.has(CTRL_OR_CMD);

        // Only update if the state actually changed
        setModKeyPressed(prev => {
            if (prev === pressed) return prev;
            return pressed;
        });
    }, [keysPressed]);

    return isModKeyPressed;
}

interface ModKeyPressedProviderProps {
    children: React.ReactNode;
}

export function ModKeyPressedProvider({children}: ModKeyPressedProviderProps) {
    const isModKeyPressed = useModKeyPressed();

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({isModKeyPressed}), [isModKeyPressed]);

    return <ModKeyPressedContext.Provider value={contextValue}>{children}</ModKeyPressedContext.Provider>;
}

export function useModKeyPressedConsumer() {
    const context = useContext(ModKeyPressedContext);

    if (!context) {
        throw new Error('useModKeyPressedConsumer must be used within a ModKeyPressedProvider');
    }

    return context.isModKeyPressed;
}
