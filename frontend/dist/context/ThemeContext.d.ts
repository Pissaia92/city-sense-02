import { type ReactNode } from 'react';
interface ThemeContextType {
    darkMode: boolean;
    toggleDarkMode: () => void;
}
export declare const ThemeContext: import("react").Context<ThemeContextType>;
export declare const ThemeProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ThemeContext.d.ts.map