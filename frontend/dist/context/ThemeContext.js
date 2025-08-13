import { jsx as _jsx } from "react/jsx-runtime";
// src/context/ThemeContext.tsx
import { createContext, useState, useEffect } from 'react';
export const ThemeContext = createContext({
    darkMode: false,
    toggleDarkMode: () => { }
});
export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('city-sense-dark-mode');
        if (saved !== null)
            return JSON.parse(saved);
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    useEffect(() => {
        localStorage.setItem('city-sense-dark-mode', JSON.stringify(darkMode));
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    const toggleDarkMode = () => setDarkMode(!darkMode);
    return (_jsx(ThemeContext.Provider, { value: { darkMode, toggleDarkMode }, children: children }));
};
//# sourceMappingURL=ThemeContext.js.map