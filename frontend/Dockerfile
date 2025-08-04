# 🐳 Etapa 1: Instalação de dependências
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# 🛠️ Etapa 2: Build do app
FROM node:18-alpine AS builder
WORKDIR /app

# Habilita suporte a ES Modules
ENV NODE_OPTIONS=--experimental-vm-modules

# Copia as dependências
COPY --from=dependencies /app/node_modules ./node_modules

# Copia os arquivos do frontend
COPY . .

# Constrói o app
RUN npm run build

# 🚀 Etapa 3: Servidor Nginx com build final
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]