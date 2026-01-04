
# Manual de Operação LiveGo (Local vs VPS)

Este guia explica como manter sua API online enquanto desenvolve no seu PC.

## 1. Como gerar a pasta para a VPS
A sua API está na pasta `/backend`. Para subir para a VPS:
1.  **Não envie as pastas `node_modules` nem `.git`.**
2.  Zipe apenas o conteúdo da pasta `/backend` (arquivos `.ts`, `package.json`, etc).
3.  Envie para a sua VPS na pasta `/var/www/livego/backend`.

## 2. Comandos para rodar na VPS (Ubuntu)
Após enviar os arquivos, acesse via SSH e execute:
```bash
cd /var/www/livego/backend
npm install
pm2 start server.ts --name "livego-api" --interpreter ./node_modules/.bin/ts-node
pm2 save
```

## 3. Como testar Localmente falando com a VPS
Se você quer que o seu Frontend (rodando no seu Windows/Mac) envie presentes e chat para a VPS:
1. Vá em `services/config.ts`.
2. Mude `const CONNECTION_MODE = 'local'` para `'vps'`.
3. Salve o arquivo. O React vai recarregar e agora todos os cliques em "Enviar Presente" vão bater no IP `72.60.249.175`.

## 4. Estrutura de Pastas Final
- `/backend` -> **SÓ ISSO VAI PARA A VPS.** Contém o servidor Express, rotas de presentes, carteira e banco de dados.
- `/src` ou `raiz /` -> **FICA SÓ NO SEU PC.** Contém as telas (React), estilos e componentes visuais.
- `/server` -> **PODE APAGAR.** Esta pasta era uma duplicata confusa.
