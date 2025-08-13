interface LoadingStateProps {
    darkMode?: boolean;
}
export declare const LoadingState: ({ darkMode }: LoadingStateProps) => import("react/jsx-runtime").JSX.Element;
interface ErrorStateProps {
    error: string;
    onRetry: () => void;
    darkMode?: boolean;
}
export declare const ErrorState: ({ error, onRetry, darkMode }: ErrorStateProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=States.d.ts.map