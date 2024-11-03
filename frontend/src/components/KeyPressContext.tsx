import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ModKeyPressedContextProps {
    isModKeyPressed: boolean;
}

const ModKeyPressedContext = createContext<
    ModKeyPressedContextProps | undefined
>(undefined);

export function useKeysPressed(allowedKeys: string[] | undefined) {
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);
    let allowAll = false;

    if (
        !allowedKeys ||
        (Array.isArray(allowedKeys) && allowedKeys.length === 0)
    ) {
        allowAll = true;
    }

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const { key } = event;
            if (allowAll || (allowedKeys && allowedKeys.includes(key))) {
                setPressedKeys(previousPressedKeys => [
                    ...previousPressedKeys,
                    key,
                ]);
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            const { key } = event;
            if (allowAll || (allowedKeys && allowedKeys.includes(key))) {
                setPressedKeys(previousPressedKeys =>
                    previousPressedKeys.filter(k => k !== key),
                );
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [allowedKeys]);

    return pressedKeys;
}

export function useModKeyPressed() {
    const keysPressed = useKeysPressed(['Meta', 'Control']);
    const [isModKeyPressed, setModKeyPressed] = useState(false);

    useEffect(() => {
        const isDarwin = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
        const CTRL_OR_CMD = isDarwin ? 'Meta' : 'Control';
        const pressed = keysPressed.includes(CTRL_OR_CMD);

        setModKeyPressed(pressed);
    }, [keysPressed]);

    return isModKeyPressed;
}

interface ModKeyPressedProviderProps {
    children: React.ReactNode;
}

export function ModKeyPressedProvider({
    children,
}: ModKeyPressedProviderProps) {
    const state = useModKeyPressed();

    return (
        <ModKeyPressedContext.Provider value={{ isModKeyPressed: state }}>
            {children}
        </ModKeyPressedContext.Provider>
    );
}

export function useModKeyPressedConsumer() {
    const context = useContext(ModKeyPressedContext);

    if (!context) {
        throw new Error(
            'useModKeyPressedConsumer must be used within a ModKeyPressedProvider',
        );
    }

    return context.isModKeyPressed;
}
