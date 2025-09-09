"""Script para consolidar todos os arquivos JSON de dados em um único Parquet.
"""
import sys
import os
from pathlib import Path

# Adiciona o diretório 'pipelines' ao path para poder importar
pipelines_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pipelines')
if pipelines_dir not in sys.path:
    sys.path.insert(0, pipelines_dir)

try:
    # Verificando se data_consolidator.py existe e tem a função load_all_data
    from data_consolidator import load_all_data
    import polars as pl

    def main():
        print("Iniciando consolidação de dados...")
        
        # --- CORREÇÃO: Caminho para os arquivos .json ---
        # O log mais recente mostrou que os arquivos .json estão em backend/pipelines/data/
        data_dir = Path(__file__).parent / "pipelines" / "data"
        print(f"📁 Procurando arquivos JSON em: {data_dir}")
        
        # Verificação adicional caso a pasta padrão esteja vazia
        if not data_dir.exists():
            print(f"❌ Diretório de dados não encontrado: {data_dir}")
            # Tentativa alternativa: backend/data
            data_dir = Path(__file__).parent / "data"
            print(f"📁 (Tentativa alternativa) Procurando arquivos JSON em: {data_dir}")
            if not data_dir.exists():
                 print(f"❌ Diretório de dados alternativo também não encontrado: {data_dir}")
                 return

        if not data_dir.exists():
            print(f"❌ Diretório de dados não encontrado: {data_dir}")
            return

        # Verifica se há arquivos .json
        json_files = list(data_dir.glob("*.json"))
        if not json_files:
            print("⚠️ Nenhum arquivo .json encontrado no diretório.")
            # Listar conteúdo do diretório para depuração
            print(f"Conteúdo de {data_dir}:")
            for item in data_dir.iterdir():
                print(f"  - {item.name}")
            return

        # Chama a função de consolidação
        df_consolidado = load_all_data(data_dir)
        
        if df_consolidado.is_empty():
            print("⚠️ Nenhum dado encontrado para consolidar.")
            return

        # Salvar o arquivo consolidado na pasta 'data' da raiz backend
        output_dir = Path(__file__).parent / "data"
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / "consolidated_data.parquet"
        
        print(f"💾 Escrevendo {df_consolidado.height} linhas em {output_path}...")
        df_consolidado.write_parquet(output_path)
        print("✅ Dados consolidados salvos com sucesso.")

    if __name__ == "__main__":
        main()

except ImportError as e:
    print(f"❌ Erro de importação: {e}")
    print("Verifique se o arquivo 'data_consolidator.py' existe em 'backend/pipelines/' e se contém a função 'load_all_data'.")
    
    # Diagnóstico adicional
    pipelines_path = Path(__file__).parent / "pipelines"
    if pipelines_path.exists():
        print(f"\n🔍 Diagnóstico: Arquivos em {pipelines_path}:")
        for f in pipelines_path.iterdir():
            if f.is_file():
                print(f"  - {f.name}")
        print(f"\n🔍 Diagnóstico: Pastas em {pipelines_path}:")
        for f in pipelines_path.iterdir():
            if f.is_dir():
                print(f"  - {f.name}/")
    else:
        print(f"Diretório {pipelines_path} não encontrado.")
        
except Exception as e:
    print(f"❌ Erro durante a consolidação: {e}")
    import traceback
    traceback.print_exc()
