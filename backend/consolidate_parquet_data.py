"""
Script para consolidar dados dos arquivos Parquet gerados pelos ETLs
em um único arquivo Parquet compatível com o modelo de treinamento.
"""
import polars as pl
from pathlib import Path
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def consolidate_parquet_data(weather_parquet_path: Path, traffic_parquet_path: Path, output_path: Path):
    """
    Lê os arquivos Parquet de clima e trânsito, os combina e salva um consolidado.
    
    Args:
        weather_parquet_path (Path): Caminho para weather_data.parquet.
        traffic_parquet_path (Path): Caminho para traffic_data.parquet.
        output_path (Path): Caminho para salvar o arquivo consolidado.
    """
    try:
        logger.info("Iniciando consolidação de dados Parquet...")
        
        # 1. Ler os arquivos Parquet
        if not weather_parquet_path.exists():
            logger.error(f"❌ Arquivo de clima não encontrado: {weather_parquet_path}")
            return
        if not traffic_parquet_path.exists():
            logger.error(f"❌ Arquivo de trânsito não encontrado: {traffic_parquet_path}")
            return
            
        df_weather = pl.read_parquet(weather_parquet_path)
        df_traffic = pl.read_parquet(traffic_parquet_path)
        
        logger.info(f"✅ Dados de clima carregados: {df_weather.height} linhas")
        logger.info(f"✅ Dados de trânsito carregados: {df_traffic.height} linhas")
        
        # 2. Calcular médias para ter um único valor por tipo de dado
        # Para simplificar, vamos pegar a última entrada de cada um
        # Em um cenário real, você pode querer fazer uma média ou outro tipo de agregação
        
        # Clima (pegando a última linha)
        latest_weather = df_weather.tail(1)
        avg_temperature = latest_weather['temperature'][0]
        avg_humidity = latest_weather['humidity'][0]
        timestamp_str = latest_weather['timestamp'][0]
        
        # Converter timestamp para extrair dia da semana e mês
        dt_obj = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00')) # Lidar com o formato ISO
        day_of_week = dt_obj.weekday()
        month = dt_obj.month
        
        # Trânsito (calculando a média do delay)
        avg_traffic_delay = df_traffic['delay'].mean()
        # Se avg_traffic_delay for null, usar 0
        if avg_traffic_delay is None:
            avg_traffic_delay = 0.0
        # Converter de segundos para minutos
        avg_traffic_delay_minutes = avg_traffic_delay / 60.0
        
        # 3. Criar um DataFrame com os dados consolidados no formato esperado pelo modelo
        # NOTA: Estamos criando dados sintéticos para 'iqv_overall' pois não temos ele nos ETLs.
        # Em um cenário real, você precisaria de uma forma de calcular ou obter esse valor.
        # Para fins de treinamento, vamos usar um valor fixo ou uma fórmula simples.
        # Esta parte precisa ser ajustada com base na lógica real do seu projeto.
        
        # Exemplo de cálculo simplificado de IQV (ajuste conforme necessário)
        # Esta é uma fórmula arbitrária para gerar um valor de target
        iqv_overall = (
            80  # Base
            - 0.5 * abs(avg_temperature - 22)  # Temperatura ideal é 22°C
            - 0.2 * abs(avg_humidity - 50)    # Humidade ideal é 50%
            - 0.8 * avg_traffic_delay_minutes # Mais atraso = pior IQV
            + (10 if 6 <= month <= 8 else 0)  # Penalidade para inverno (exemplo)
        )
        iqv_overall = max(0, min(100, iqv_overall)) # Limitar entre 0 e 100
        
        # Criar o DataFrame consolidado
        consolidated_data = pl.DataFrame([{
            "temperature": avg_temperature,
            "humidity": avg_humidity,
            "traffic_delay": avg_traffic_delay_minutes, # Em minutos
            "day_of_week": day_of_week,
            "month": month,
            "iqv_overall": iqv_overall
        }])
        
        # Replicar os dados para ter várias linhas (o modelo precisa de várias amostras)
        # Vamos criar 100 linhas com pequenas variações
        import numpy as np
        np.random.seed(42)
        n_samples = 100
        variations = []
        for i in range(n_samples):
            temp_var = np.random.normal(0, 1)
            humidity_var = np.random.normal(0, 2)
            traffic_var = np.random.normal(0, 2) # minutos
            
            temp = max(-10, min(50, avg_temperature + temp_var))
            humidity = max(0, min(100, avg_humidity + humidity_var))
            traffic = max(0, avg_traffic_delay_minutes + traffic_var)
            
            # Recalcular IQV com base nas variações
            iqv = (
                80
                - 0.5 * abs(temp - 22)
                - 0.2 * abs(humidity - 50)
                - 0.8 * traffic
                + (10 if 6 <= month <= 8 else 0)
            )
            iqv = max(0, min(100, iqv))
            
            variations.append({
                "temperature": temp,
                "humidity": humidity,
                "traffic_delay": traffic,
                "day_of_week": day_of_week, # Mantém o mesmo para simplificar
                "month": month,             # Mantém o mesmo para simplificar
                "iqv_overall": iqv
            })
            
        consolidated_df = pl.DataFrame(variations)
        
        # 4. Salvar o DataFrame consolidado
        consolidated_df.write_parquet(output_path)
        logger.info(f"✅ Dados consolidados salvos em: {output_path}")
        logger.info(f"📊 Número de amostras geradas: {consolidated_df.height}")
        logger.info("Visualização das primeiras linhas:")
        print(consolidated_df.head())
        
    except Exception as e:
        logger.error(f"❌ Erro na consolidação de dados Parquet: {e}")
        raise

def main():
    """Função principal."""
    data_dir = Path(__file__).parent / "data"
    weather_file = data_dir / "weather_data.parquet"
    traffic_file = data_dir / "traffic_data.parquet"
    output_file = data_dir / "consolidated_data.parquet"
    
    consolidate_parquet_data(weather_file, traffic_file, output_file)

if __name__ == "__main__":
    main()