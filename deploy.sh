#!/bin/bash

# Navega para o diretório do servidor
cd "$(dirname "$0")/server"

# Instala as dependências
echo "Instalando dependências..."
npm install

# Constrói o projeto
echo "Construindo o projeto..."
npm run build

# Navega para a pasta dist
cd dist

# Inicia o servidor em produção
echo "Iniciando o servidor..."
NODE_ENV=production node --es-module-specifier-resolution=node server.js
NODE_ENV=production node --loader ts-node/esm server.ts