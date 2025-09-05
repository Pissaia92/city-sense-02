# backend/ml/quality_of_life_model.py
# Atualizado para usar Polars e manter consistência com o projeto
import polars as pl
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import logging
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_MODEL_PATH = MODEL_DIR / "qv_model.pkl" # Ou "iqv_predictor.pkl", conforme sua convenção

def _get_season(month: int) -> int:
    """Mapeia o mês para uma estação (1: Verão, 2: Outono, 3: Inverno, 4: Primavera)"""
    if month in [12, 1, 2]:
        return 1  # Verão
    elif month in [3, 4, 5]:
        return 2  # Outono
    elif month in [6, 7, 8]:
        return 3  # Inverno
    else:
        return 4  # Primavera

def train_quality_of_life_model(data_path: str, model_path: str = str(DEFAULT_MODEL_PATH)):
    """
    Treina o modelo de Qualidade de Vida com dados de entrada e salva usando joblib.
    
    Args:
        data_path (str): Caminho para o arquivo Parquet com os dados de treinamento.
        model_path (str): Caminho para salvar o modelo treinado.
    """
    try:
        # 1. Carregar dados com Polars
        logger.info(f"Carregando dados de treinamento de {data_path}")
        df = pl.read_parquet(data_path)
        
        # 2. Verificar colunas necessárias
        required_columns = ['temperature', 'humidity', 'traffic_delay', 'day_of_week', 'month', 'iqv_overall']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Colunas necessárias ausentes no dataset: {missing_cols}")
            
        # 3. Preparar features
        logger.info("Preparando features...")
        
        # Criar features derivadas
        df = df.with_columns([
            (pl.col('temperature') * pl.col('humidity')).alias('temp_humidity_interaction'),
            pl.when(pl.col('day_of_week') >= 5).then(1).otherwise(0).alias('is_weekend'),
            pl.col('month').apply(_get_season).alias('season') # Se precisar de mais performance, use .map_elements
        ])
        
        # Selecionar features e target
        feature_columns = ['temperature', 'humidity', 'traffic_delay', 
                          'temp_humidity_interaction', 'is_weekend', 'season']
        target_column = 'iqv_overall'
        
        # Converter para numpy para o Scikit-learn
        X = df.select(feature_columns).to_numpy()
        y = df.select(target_column).to_numpy().ravel() # .ravel() para converter de (n, 1) para (n,)
        
        # 4. Dividir dados
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # 5. Treinar modelo
        logger.info("Treinando modelo RandomForestRegressor...")
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 6. Avaliar modelo
        y_pred = model.predict(X_test)
        rmse = mean_squared_error(y_test, y_pred, squared=False)
        logger.info(f"Modelo treinado com RMSE: {rmse:.2f}")
        
        # 7. Salvar modelo com joblib
        joblib.dump(model, model_path)
        logger.info(f"Modelo salvo em {model_path}")
        
    except Exception as e:
        logger.error(f"Erro no treinamento do modelo: {e}")
        raise

if __name__ == "__main__":
    consolidated_data_path = Path(__file__).parent.parent / "data" / "consolidated_data.parquet"
    train_quality_of_life_model(str(consolidated_data_path))
