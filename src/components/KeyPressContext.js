import React, { useState, useEffect } from 'react';

const ModKeyPressedContext = React.createContext();

// custom hook to set an array of pressed keys
export function useKeysPressed(allowedKeys) {
	const [pressedKeys, setPressedKeys] = useState([]);
	let allowAll = false;
	if (
		!allowedKeys ||
		(Array.isArray(allowedKeys) && allowedKeys.length === 0)
	) {
		allowAll = true;
	}
	useEffect(() => {
		console.log('Calling');
		const onKeyDown = event => {
			const { key } = event;
			if (allowAll || allowedKeys.includes(key)) {
				setPressedKeys(previousPressedKeys => [...previousPressedKeys, key]);
			}
		};

		const onKeyUp = event => {
			const { key } = event;
			if (allowAll || allowedKeys.includes(key)) {
				setPressedKeys(previousPressedKeys =>
					previousPressedKeys.filter(k => k !== key)
				);
			}
		};

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
		};
		// eslint-disable-next-line
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return pressedKeys;
}

const isDarwin = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
const CTRL_OR_CMD = isDarwin ? 'Meta' : 'Control';

// another custom hook composed from the useKeysPressed hook
export function useModKeyPressed() {
	const keysPressed = useKeysPressed([CTRL_OR_CMD]);
	const [isModKeyPressed, setModKeyPressed] = useState(false);
	const pressed = keysPressed.includes(CTRL_OR_CMD);
	if (pressed !== isModKeyPressed) {
		setModKeyPressed(pressed);
	}
	return isModKeyPressed;
}

// simple provider/consumer to use the context
export function ModKeyPressedProvider({ children }) {
	const state = useModKeyPressed();
	return (
		<ModKeyPressedContext.Provider value={state}>
			{children}
		</ModKeyPressedContext.Provider>
	);
}

export function useModKeyPressedConsumer() {
	const context = React.useContext(ModKeyPressedContext);
	if (context === undefined) {
		throw new Error('useCountState must be used within a CountProvider');
	}
	return context;
}
