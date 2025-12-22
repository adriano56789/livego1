#!/bin/sh

# Inicia o nginx em segundo plano
nginx

# Navega para o diretório do backend e inicia o servidor Node.js
cd /app/server
node dist/server.js
