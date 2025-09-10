import React from 'react';

interface InitialStateProps {
  onFetchData: (city: string) => void;
}

export const InitialState: React.FC<InitialStateProps> = ({ onFetchData }) => {
  return (
    <div className="initial-state">
      <h2>🌍 Bem-vindo ao City Sense</h2>
      <p>
        Descubra o Índice de Qualidade de Vida das cidades ao redor do mundo.
        Digite o nome de uma cidade acima para começar.
      </p>
      <button 
        className="retry-button"
        onClick={() => onFetchData('São Paulo')}
      >
        Carregar dados de São Paulo
      </button>
    </div>
  );
};