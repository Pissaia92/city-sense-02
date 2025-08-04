# backend/Dockerfile
FROM python:3.10

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia o arquivo de dependências do Python
COPY requirements.txt .

# Instala as dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia os arquivos do backend
COPY . .

# Expõe a porta
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["python", "main.py"]