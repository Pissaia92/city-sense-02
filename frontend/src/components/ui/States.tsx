import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="loading-state">
      <div className="loading-spinner">🌍</div>
      <p>{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-message">{message}</div>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
};