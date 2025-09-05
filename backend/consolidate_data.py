"""
Script para consolidar todos os arquivos JSON de dados reais em um único Parquet.
"""
import sys
import os

# Adiciona o diretório 'pipelines' ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'pipelines'))

# Importa a função de consolidação que você tem (do data_processing.py atualizado)
from data_processing import load_all_data
import polars as pl
from pathlib import Path

def main():
    print("Iniciando consolidação de dados reais...")
    
    # Aponta para o diretório onde estão os arquivos .json reais
    data_dir = Path(__file__).parent / "pipelines" / "data"
    print(f"📁 Procurando arquivos JSON em: {data_dir}")
    
    if not data_dir.exists():
        print(f"❌ Diretório de dados não encontrado: {data_dir}")
        return

    # Usa a função load_all_data que já existe e foi atualizada para Polars
    df_consolidado = load_all_data(data_dir)
    
    if df_consolidado.is_empty():
        print("⚠️ Nenhum dado encontrado para consolidar.")
        return

    # Salva o arquivo consolidado na pasta 'data' da raiz backend
    output_dir = Path(__file__).parent / "data"
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "consolidated_data.parquet"
    
    print(f"💾 Escrevendo {df_consolidado.height} linhas em {output_path}...")
    df_consolidado.write_parquet(output_path)
    print("✅ Dados reais consolidados salvos com sucesso.")

if __name__ == "__main__":
    main()