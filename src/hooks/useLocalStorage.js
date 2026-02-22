import { useState, useCallback } from 'react';

/**
 * Custom hook to persist state to localStorage
 * @param {string} key - The key to store the value under in localStorage
 * @param {any} initialValue - The initial value to use if no value is found in localStorage
 * @returns {[any, Function]} - The state value and a setter function
 */
export default function useLocalStorage(key, initialValue) {
    // Get from local storage then parse stored json or return initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Wrapped setter that persists to localStorage using functional updates
    // to avoid stale closure over storedValue
    const setValue = useCallback((value) => {
        try {
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}
