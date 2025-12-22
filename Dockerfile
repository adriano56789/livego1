# Estágio de build do frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o restante do código
COPY . .

# Constrói o frontend
RUN npm run build

# Estágio de build do backend
FROM node:18-alpine as backend-builder

WORKDIR /app

# Copia os arquivos do backend
COPY server/package*.json ./server/

# Instala as dependências do backend
WORKDIR /app/server
RUN npm ci

# Copia o código do backend
WORKDIR /app
COPY server/ ./server/

# Compila o TypeScript do backend
WORKDIR /app/server
RUN npx tsc

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Instala o servidor web (nginx) e outras dependências necessárias
RUN apk add --no-cache nginx

# Cria diretório para os logs do nginx
RUN mkdir -p /var/log/nginx && \
    mkdir -p /run/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log

# Configura o nginx
COPY nginx/nginx-simple.conf /etc/nginx/nginx.conf

# Copia os arquivos estáticos do frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Configura o backend
WORKDIR /app/server
COPY --from=backend-builder /app/server/package*.json ./
COPY --from=backend-builder /app/server/dist ./dist

# Instala as dependências de produção do backend
RUN npm ci --only=production

# Expõe as portas (80 para nginx, 3000 para o servidor Node.js)
EXPOSE 80 3000

# Cria o script de inicialização
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx -g "daemon off;" &' >> /app/start.sh && \
    echo 'cd /app/server && node dist/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Comando para iniciar a aplicação
CMD ["/bin/sh", "/app/start.sh"]
