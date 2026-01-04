
import mongoose from 'mongoose';
import { config } from './config/settings';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log(`✅ Conectado ao MongoDB Real em: ${config.mongoUri}`);
    } catch (err) {
        console.error("❌ Falha na conexão com o banco de dados:", err);
        // Em produção, você pode querer lançar o erro para o servidor não iniciar sem banco
    }
};
