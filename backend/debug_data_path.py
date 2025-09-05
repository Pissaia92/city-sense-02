# backend/debug_data_path.py
from pathlib import Path

# Caminho que o script consolidate_data.py está usando
data_dir = Path(__file__).parent / "pipelines" / "data"

print(f"Diretório sendo verificado: {data_dir}")
print(f"Este diretório existe? {data_dir.exists()}")

if data_dir.exists():
    json_files = list(data_dir.glob("*.json"))
    print(f"Número de arquivos .json encontrados: {len(json_files)}")
    if json_files:
        print("Exibindo os 5 primeiros arquivos encontrados:")
        for f in json_files[:5]:
            print(f"  - {f.name}")
    else:
        print("Nenhum arquivo .json foi encontrado na pasta.")
else:
    print("O diretório não existe. Verifique o caminho.")