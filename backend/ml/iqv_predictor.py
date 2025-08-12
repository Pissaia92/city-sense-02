import joblib
import pandas as pd
import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import os
import logging

logger = logging.getLogger(__name__)

class IQVPredictor:
    def __init__(self, model_path=None):
        self.model = None
        self.model_path = model_path
        self.is_trained = False
        
        if model_path and os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.is_trained = True
                logger.info(f"Modelo carregado com sucesso de {model_path}")
            except Exception as e:
                logger.error(f"Erro ao carregar modelo de {model_path}: {str(e)}")
    
    def train(self, historical_data):
        """Treina o modelo com dados históricos"""
        try:
            df = pd.DataFrame(historical_data)
            
            # Cria features relevantes
            df['temp_humidity_interaction'] = df['temperature'] * df['humidity']
            df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
            df['season'] = df['month'].apply(self._get_season)
            
            # Prepara dados para treinamento
            X = df[['temperature', 'humidity', 'traffic_delay', 
                   'temp_humidity_interaction', 'is_weekend', 'season']]
            y = df['iqv_overall']
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.model.fit(X_train, y_train)
            y_pred = self.model.predict(X_test)
            rmse = mean_squared_error(y_test, y_pred, squared=False)
            
            logger.info(f"Modelo treinado com RMSE: {rmse:.2f}")
            self.is_trained = True
            
            # Salva o modelo treinado
            if self.model_path:
                os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
                joblib.dump(self.model, self.model_path)
                logger.info(f"Modelo salvo em {self.model_path}")
            
            return rmse
        except Exception as e:
            logger.error(f"Erro no treinamento do modelo: {str(e)}")
            raise
    
    def predict(self, current_data):
        """Faz previsões para novos dados"""
        if not self.is_trained:
            logger.warning("Modelo não treinado. Usando valor padrão.")
            return 7.5  # Valor padrão se o modelo não estiver treinado
        
        try:
            # Cria features para previsão
            current_date = datetime.datetime.now()
            features = pd.DataFrame([{
                'temperature': current_data['temperature'],
                'humidity': current_data['humidity'],
                'traffic_delay': current_data['traffic_delay'],
                'temp_humidity_interaction': current_data['temperature'] * current_data['humidity'],
                'is_weekend': 1 if current_date.weekday() >= 5 else 0,
                'season': self._get_season(current_date.month)
            }])
            
            return float(self.model.predict(features)[0])
        except Exception as e:
            logger.error(f"Erro na previsão: {str(e)}")
            return 7.5  # Valor padrão em caso de erro
    
    def _get_season(self, month):
        """Determina a estação do ano com base no mês"""
        if month in [12, 1, 2]:
            return 0  # Verão
        elif month in [3, 4, 5]:
            return 1  # Outono
        elif month in [6, 7, 8]:
            return 2  # Inverno
        else:
            return 3  # Primavera
    
    def is_model_available(self):
        """Verifica se o modelo está disponível para uso"""
        return self.is_trained