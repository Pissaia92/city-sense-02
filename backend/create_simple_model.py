import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import os

print("Criando modelo mínimo...")

# Dados de exemplo simples
X = np.array([[25, 60, 10], [30, 80, 20], [20, 50, 5]])
y = np.array([7.2, 5.1, 8.0])

# Cria modelo simples
model = RandomForestRegressor(n_estimators=3, random_state=42)
model.fit(X, y)

# Salva modelo
model_path = "ml/ml_model.pkl"
os.makedirs("ml", exist_ok=True)
joblib.dump(model, model_path)

print(f"✅ Modelo criado e salvo em: {model_path}")

# Testa carregamento
try:
    loaded_model = joblib.load(model_path)
    print("✅ Modelo carregado com sucesso!")
    print(f"Previsão de teste: {loaded_model.predict([[25]][[60]][[10]])}")
except Exception as e:
    print(f"❌ Erro ao carregar: {e}")

print("✅ Processo concluído!")