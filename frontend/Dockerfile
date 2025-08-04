# frontend/Dockerfile
# 🐳 Etapa 1: Instalação de dependências
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# 🛠️ Etapa 2: Servidor de desenvolvimento
FROM node:18-alpine
WORKDIR /app

# Copia as dependências
COPY --from=dependencies /app/node_modules ./node_modules

# O código fonte será montado via volume no docker-compose
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]