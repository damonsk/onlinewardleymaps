import { useState, useEffect } from 'react';
// store.js wrapper for errors and fallbacks
import store from 'store';
// const { get, set } = store;
export default function useLocalStorage(key, initialValue) {
	const [state, setState] = useState(store.get(key) || initialValue);

	// Only persist to storage if state changes.
	useEffect(() => {
		// persist to localStorage
		store.set(key, state);
	}, [state, key]);

	return [state, setState];
}
