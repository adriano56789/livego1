# Estágio de build
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./

# Instala as dependências de desenvolvimento e constrói o projeto
RUN npm ci && npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --only=production

# Copia os arquivos compilados do estágio de build
COPY --from=builder /usr/src/app/dist ./dist

# Copia o arquivo .env se existir
COPY .env* ./

# Expõe a porta 3000
EXPOSE 3000

# Define a variável de ambiente NODE_ENV para produção
ENV NODE_ENV=production

# Comando para iniciar o servidor
CMD ["node", "dist/server.js"]
