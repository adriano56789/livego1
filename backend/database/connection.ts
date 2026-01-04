
import mongoose from 'mongoose';
import process from 'process';
import { config } from '../config/settings';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log(`✅ MongoDB Conectado na VPS em: ${config.mongoUri}`);
    } catch (err) {
        console.error("❌ Erro de conexão MongoDB:", err);
        (process as any).exit(1);
    }
};
