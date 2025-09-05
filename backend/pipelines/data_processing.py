# Este arquivo pode ser usado para funções de consolidação de dados, se necessário
# Ou pode ser renomeado/removido se não for mais usado

import polars as pl
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def load_all_data(data_dir: Path) -> pl.DataFrame:
    """
    Carrega todos os arquivos JSON de uma pasta e os combina em um único DataFrame Polars.
    """
    logger.info(f"Procurando arquivos JSON em {data_dir}")
    json_files = list(data_dir.glob("*.json"))
    
    if not json_files:
        logger.warning("Nenhum arquivo .json encontrado.")
        return pl.DataFrame()

    dataframes = []
    for file_path in json_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            data["source_file"] = file_path.name
            df_temp = pl.DataFrame([data])
            dataframes.append(df_temp)
        except Exception as e:
            logger.warning(f"Erro ao ler {file_path}: {e}")
            continue

    if dataframes:
        combined_df = pl.concat(dataframes, how="vertical")
        logger.info(f"✅ {len(dataframes)} arquivos JSON carregados e combinados.")
        return combined_df
    else:
        logger.warning("Nenhum dado válido encontrado nos arquivos JSON.")
        return pl.DataFrame()