import os
import json
from datetime import datetime
from pathlib import Path
import logging
import unicodedata

logger = logging.getLogger(__name__)

def normalize_city_name(city: str) -> str:
    """
    Remove acentos e normaliza o nome da cidade.
    Ex: 'São Paulo' -> 'Sao Paulo'
    """
    normalized = unicodedata.normalize('NFD', city)
    ascii_city = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return ascii_city.strip()

def save_to_database(city: str, data: dict):
    """Salva dados no banco de dados ou arquivo."""
    try:
        # Caminho absoluto usando pathlib
        data_dir = Path(__file__).parent.parent.parent / "data"
        os.makedirs(data_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{city.replace(' ', '_')}_{timestamp}.json"
        filepath = data_dir / filename
        
        with open(filepath, "w", encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"💾 Dados salvos em {filepath}")
    except Exception as e:
        logger.error(f"❌ Erro ao salvar dados: {e}")
