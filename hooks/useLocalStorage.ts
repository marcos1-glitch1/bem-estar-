import { useState, Dispatch, SetStateAction } from 'react';

// Custom hook to sync state with localStorage, now user-specific
export function useUserLocalStorage<T>(userId: string, key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
    const compositeKey = `wellness-app-${userId}-${key}`;

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(compositeKey);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: Dispatch<SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(compositeKey, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}