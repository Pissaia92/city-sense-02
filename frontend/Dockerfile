FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18-alpine
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]