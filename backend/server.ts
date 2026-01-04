
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './database/connection.js';
import apiRoutes from './routes/api.js';
import { config } from './config/settings.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);
const PORT = config.port;

// 1. CORS deve ser o PRIMEIRO middleware
app.use(cors({
    origin: "*", // Permite qualquer origem para evitar bloqueio no navegador
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
}) as any);

// 2. Parser de JSON
app.use(express.json({ limit: '10mb' }) as any);

// 3. Logger de Requisições
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// 4. Rotas da API
app.use('/api', apiRoutes);

// 5. Rota raiz para teste rápido
app.get('/', (req, res) => {
    res.send('<h1>Servidor LiveGo Online</h1><p>API em: <a href="/api/status">/api/status</a></p>');
});

// 6. Tratamento de Erros REST Global
app.use(globalErrorHandler as any);

// Inicialização
connectDB().then(() => {
    const io = new Server(server, { 
        cors: { origin: "*" },
        transports: ['websocket']
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`
        ################################################
        👑 API REST DEDICADA LIVEGO - ONLINE
        ⚡️ PORTA: ${PORT}
        🔍 IP DA VPS: 72.60.249.175
        🚀 TESTE: http://72.60.249.175:3000/api/status
        ################################################
        `);
    });
}).catch(err => {
    console.error("ERRO CRÍTICO NA INICIALIZAÇÃO:", err);
});
