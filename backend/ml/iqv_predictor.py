# backend/ml/iqv_predictor.py
import os
import logging
import numpy as np
import joblib
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IQVPredictor:
    def __init__(self, model_path: str = "./models/qv_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.is_trained = False
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                self.is_trained = True
                logger.info(f"✅ Modelo carregado com sucesso de {self.model_path}")
            except Exception as e:
                logger.error(f"❌ Erro ao carregar o modelo de {self.model_path}: {e}")
                self.model = None
                self.is_trained = False
        else:
            logger.warning(f"⚠️ Arquivo de modelo não encontrado em {self.model_path}")
            self.model = None
            self.is_trained = False

    def predict(self, features: Dict[str, Any]) -> float:
        if not self.is_trained or self.model is None:
            logger.warning("⚠️ Modelo não disponível. Retornando valor padrão.")
            return 7.5

        try:
            feature_vector = list(features.values())
            model_input = np.array(feature_vector).reshape(1, -1)
            prediction = self.model.predict(model_input)
            predicted_iqv = float(prediction[0])
            logger.info(f"🔮 Previsão de IQV: {predicted_iqv:.2f}")
            return predicted_iqv
        except Exception as e:
            logger.error(f"❌ Erro durante a previsão: {e}")
            return 7.5
