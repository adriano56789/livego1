import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 3000,
    // Define a string solicitada como padrão absoluto para evitar confusão com variáveis de ambiente
    mongoUri: 'mongodb://localhost:27017/livego',
    jwtSecret: process.env.JWT_SECRET || '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
};