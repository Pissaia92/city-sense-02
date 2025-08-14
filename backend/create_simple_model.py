# create_compatible_model.py
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn import __version__ as sklearn_version
import os
import sys

print("=== Criando modelo compatível ===")
print(f"NumPy version: {np.__version__}")
print(f"Scikit-learn version: {sklearn_version}")
print(f"Python version: {sys.version}")

training_data = [
    {'temperature': 25, 'humidity': 60, 'traffic_delay': 10, 'iqv_overall': 7.2},
    {'temperature': 30, 'humidity': 80, 'traffic_delay': 20, 'iqv_overall': 5.1},
    {'temperature': 20, 'humidity': 50, 'traffic_delay': 5, 'iqv_overall': 8.0},
    {'temperature': 28, 'humidity': 70, 'traffic_delay': 15, 'iqv_overall': 6.5},
    {'temperature': 22, 'humidity': 65, 'traffic_delay': 8, 'iqv_overall': 7.8},
    {'temperature': 32, 'humidity': 85, 'traffic_delay': 25, 'iqv_overall': 4.9},
]

X_data = []
y_data = []

for item in training_data:
    X_data.append([
        item['temperature'],
        item['humidity'], 
        item['traffic_delay']
    ])
    y_data.append(item['iqv_overall'])

X = np.array(X_data)
y = np.array(y_data)

print(f"Formato dos dados: X={X.shape}, y={y.shape}")

try:
    model = RandomForestRegressor(
        n_estimators=3,
        max_depth=3,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=1,
        bootstrap=True
    )
    
    print("Treinando modelo...")
    model.fit(X, y)
    print("Modelo treinado com sucesso!")
    
    # Salvar com protocolo mais compatível
    model_path = "ml/ml_model.pkl"
    os.makedirs("ml", exist_ok=True)
    
    # Tentar salvar com diferentes protocols
    joblib.dump(model, model_path, protocol=2)
    print(f"Modelo salvo com protocolo 2 em: {model_path}")
    
    # Testar carregamento
    print("Testando carregamento...")
    loaded_model = joblib.load(model_path)
    test_prediction = loaded_model.predict([[25]][[60]][[10]])
    print(f"Previsão de teste: {test_prediction[0]:.2f}")
    
    print("✅ Modelo criado e validado com sucesso!")
    
except Exception as e:
    print(f"❌ Erro ao criar modelo: {e}")
    import traceback
    traceback.print_exc()