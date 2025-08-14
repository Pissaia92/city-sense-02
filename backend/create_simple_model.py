import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import os

print("=== Criando modelo totalmente novo ===")
print(f"Python version: {np.__version__}")

# Dados de exemplo simples
X = np.array([
    [25, 60, 10], [30, 80, 20], [20, 50, 5], 
    [28, 70, 15], [22, 65, 8], [32, 85, 25]
])
y = np.array([7.2, 5.1, 8.0, 6.5, 7.8, 4.9])

model = RandomForestRegressor(
    n_estimators=5,
    max_depth=5,
    random_state=42,
    n_jobs=1
)
model.fit(X, y)

# Salva modelo com protocolo mais compatível
model_path = "ml/ml_model.pkl"
os.makedirs("ml", exist_ok=True)

# Salvar com protocolo 2 para máxima compatibilidade
joblib.dump(model, model_path, protocol=2)

print(f"✅ Modelo criado e salvo em: {model_path}")
print(f"Modelo criado com: {type(model)}")

# Testa carregamento
try:
    loaded_model = joblib.load(model_path)
    print("✅ Modelo carregado com sucesso!")
    prediction = loaded_model.predict([[25]][[60]][[10]])
    print(f"Previsão de teste: {prediction[0]:.2f}")
except Exception as e:
    print(f"❌ Erro ao carregar modelo: {e}")

print("✅ Processo concluído!")