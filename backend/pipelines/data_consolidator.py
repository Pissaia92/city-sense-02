import polars as pl
import json
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_all_data(data_dir: Path) -> pl.DataFrame:
    """
    Carrega todos os arquivos JSON de uma pasta e os combina em um único DataFrame Polars.
    
    Args:
        data_dir (Path): Caminho para o diretório contendo os arquivos .json.
        
    Returns:
        pl.DataFrame: DataFrame com todos os dados combinados.
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
            
            # Adiciona uma coluna com o nome do arquivo fonte (opcional, mas útil)
            data["source_file"] = file_path.name
            
            # Converte o dict para DataFrame Polars e adiciona à lista
            # NOTA: Se o JSON tiver uma estrutura aninhada complexa, isso pode precisar de ajuste.
            # Para uma lista de registros, use pl.from_dicts([data]). Para um único registro, pl.DataFrame([data])
            df_temp = pl.DataFrame([data]) # [data] porque pl.DataFrame espera uma lista de dicts
            dataframes.append(df_temp)
            
        except Exception as e:
            logger.warning(f"Erro ao ler {file_path}: {e}")
            continue

    if dataframes:
        # Combina todos os DataFrames em um só
        combined_df = pl.concat(dataframes, how="vertical")
        logger.info(f"✅ {len(dataframes)} arquivos JSON carregados e combinados.")
        return combined_df
    else:
        logger.warning("Nenhum dado válido encontrado nos arquivos JSON.")
        return pl.DataFrame()

def load_city_data(city_name: str, data_dir: Path) -> pl.DataFrame:
    """
    Carrega dados JSON para uma cidade específica.
    
    Args:
        city_name (str): Nome da cidade (ex: "Sao_Paulo").
        data_dir (Path): Caminho para o diretório de dados.
        
    Returns:
        pl.DataFrame: DataFrame com os dados da cidade.
    """
    pattern = f"{city_name}_*.json"
    logger.info(f"Procurando arquivos para '{city_name}' com padrão '{pattern}'")
    json_files = list(data_dir.glob(pattern))
    
    if not json_files:
        logger.warning(f"Nenhum arquivo encontrado para a cidade '{city_name}'.")
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
        logger.info(f"✅ {len(dataframes)} arquivos para '{city_name}' carregados.")
        return combined_df
    else:
        logger.warning(f"Nenhum dado válido encontrado para '{city_name}'.")
        return pl.DataFrame()

# Exemplo de uso (opcional)
# if __name__ == "__main__":
#     data_dir = Path(__file__).parent / "data"
#     df = load_all_data(data_dir)
#     if not df.is_empty():
#         output_path = Path(__file__).parent.parent / "data" / "consolidated_data.parquet"
#         df.write_parquet(output_path)
#         print(f"✅ Dados consolidados salvos em {output_path}")