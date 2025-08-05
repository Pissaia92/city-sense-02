import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import os

def train_qv_model():
    np.random.seed(42)
    n_samples = 1000
    data = np.random.rand(n_samples, 7)
    labels = (
        80 
        - 5 * abs(data[:, 0] - 0.5) * 100  
        - 3 * data[:, 1] * 10  
        - 2 * data[:, 2]
        - 1.5 * data[:, 3]
        - 2 * data[:, 4]
        + 3 * data[:, 5]
        + 2 * data[:, 6]
    )
    labels = np.clip(labels, 0, 100)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(data, labels)

    # Salva no diretório ml
    model_path = os.path.join(os.path.dirname(__file__), "qv_model.pkl")
    joblib.dump(model, model_path)
    print(f"✅ Modelo salvo em: {model_path}")

if __name__ == "__main__":
    train_qv_model()