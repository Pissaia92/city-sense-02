import joblib
import pandas as pd
import datetime  # ← ADICIONE ESTA LINHA
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

class IQVPredictor:
    def __init__(self, model_path=None):
        if model_path:
            self.model = joblib.load(model_path)
        else:
            self.model = RandomForestRegressor(n_estimators=100)
        
    def train(self, historical_data):
        """Treina o modelo com dados históricos"""
        df = pd.DataFrame(historical_data)
        
        # Cria features relevantes
        df['temp_humidity_interaction'] = df['temperature'] * df['humidity']
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        
        # Prepara dados para treinamento
        X = df[['temperature', 'humidity', 'traffic_delay', 
               'temp_humidity_interaction', 'is_weekend']]
        y = df['iqv_overall']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        rmse = mean_squared_error(y_test, y_pred, squared=False)
        
        print(f"Modelo treinado com RMSE: {rmse:.2f}")
        return rmse
        
    def predict(self, current_data):
        """Faz previsões para novos dados"""
        features = pd.DataFrame([{
            'temperature': current_data['temperature'],
            'humidity': current_data['humidity'],
            'traffic_delay': current_data['traffic_delay'],
            'temp_humidity_interaction': current_data['temperature'] * current_data['humidity'],
            'is_weekend': 1 if datetime.datetime.now().weekday() >= 5 else 0  # ← CORRIGIDO
        }])
        
        return self.model.predict(features)[0]