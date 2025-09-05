"""
Script para gerar dados sintéticos para treinar o modelo de Qualidade de Vida.
Gera um arquivo consolidated_data.parquet com a estrutura esperada.
"""
import polars as pl
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path

def generate_synthetic_data(n_samples: int = 2000) -> pl.DataFrame:
    """
    Gera um DataFrame Polars com dados sintéticos para treinamento.
    
    Args:
        n_samples (int): Número de amostras a gerar.
        
    Returns:
        pl.DataFrame: DataFrame com dados sintéticos.
    """
    np.random.seed(42) # Para reprodutibilidade
    
    # Gerar timestamps
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730) # 2 anos atrás
    # Distribuir amostras ao longo do período
    timestamps = [start_date + timedelta(seconds=np.random.randint(0, int((end_date - start_date).total_seconds()))) for _ in range(n_samples)]
    
    # Gerar dados base
    temperatures = np.random.normal(25, 10, n_samples) # Temperatura média 25°C
    humidities = np.random.uniform(20, 95, n_samples)  # Humidade entre 20% e 95%
    traffic_delays = np.random.exponential(8, n_samples) # Atraso de trânsito (exponencial)
    
    # Garantir limites razoáveis
    temperatures = np.clip(temperatures, -10, 50)
    humidities = np.clip(humidities, 10, 100)
    traffic_delays = np.clip(traffic_delays, 0, 60) # Até 1h de atraso
    
    # Extrair dia da semana e mês
    days_of_week = [ts.weekday() for ts in timestamps]
    months = [ts.month for ts in timestamps]
    
    # Criar um IQV "verdadeiro" baseado em uma fórmula (simulando a realidade)
    # Esta é uma fórmula arbitrária para fins de simulação
    iqv_overall = (
        70  # Base
        - 0.8 * np.abs(temperatures - 22)  # Temperatura ideal é 22°C
        - 0.3 * np.abs(humidities - 50)    # Humidade ideal é 50%
        - 0.7 * traffic_delays             # Mais atraso = pior IQV
        + np.random.normal(0, 3, n_samples) # Ruído
    )
    iqv_overall = np.clip(iqv_overall, 0, 100) # Limitar entre 0 e 100
    
    # Criar DataFrame
    df = pl.DataFrame({
        "timestamp": timestamps,
        "temperature": np.round(temperatures, 2),
        "humidity": np.round(humidities, 2),
        "traffic_delay": np.round(traffic_delays, 2),
        "day_of_week": days_of_week,
        "month": months,
        "iqv_overall": np.round(iqv_overall, 2)
    })
    
    return df

def main():
    """Gera e salva os dados sintéticos."""
    print("Gerando dados sintéticos para treinamento...")
    df = generate_synthetic_data(2000)
    
    # Caminho para salvar
    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)
    output_path = data_dir / "consolidated_data.parquet"
    
    # Salvar em Parquet
    df.write_parquet(output_path)
    print(f"✅ Dados sintéticos salvos em: {output_path}")
    print(f"📊 Número de amostras geradas: {df.height}")
    print("\nVisualização das primeiras linhas:")
    print(df.head())

if __name__ == "__main__":
    main()