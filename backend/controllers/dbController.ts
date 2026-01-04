import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendSuccess, sendError } from '../utils/response';
import { UserModel } from '../models/User';

export const dbController = {
    listCollections: async (req: any, res: any) => {
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionNames = collections.map(c => c.name);
            return sendSuccess(res, collectionNames);
        } catch (err) {
            return sendError(res, 'Falha ao listar coleções do banco de dados.');
        }
    },
    
    setupDatabase: async (req: any, res: any) => {
        try {
            const { collections: requiredCollections } = req.body;

            if (!requiredCollections || !Array.isArray(requiredCollections)) {
                return sendError(res, 'A lista de coleções para setup não foi fornecida.', 400);
            }

            const appDb = mongoose.connection.db;
            const collections = await appDb.listCollections().toArray();
            const existingNames = collections.map(c => c.name);
            const createdCollections = [];

            for (const collectionName of requiredCollections) {
                if (!existingNames.includes(collectionName)) {
                    await appDb.createCollection(collectionName);
                    createdCollections.push(collectionName);
                }
            }

            // Criação do usuário admin padrão
            let userCreated = false;
            const adminEmail = 'adriano@livego.com';
            const adminExists = await UserModel.findOne({ email: adminEmail });

            if (!adminExists) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('Adriano123', salt);
                const identification = '10000001';

                await UserModel.create({
                    id: `admin-${Date.now()}`,
                    identification,
                    name: 'Adriano Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    avatarUrl: `https://picsum.photos/seed/${identification}/200`,
                    coverUrl: `https://picsum.photos/seed/${identification}-c/1080/1920`,
                    level: 99,
                    diamonds: 999999
                });
                userCreated = true;
            }
            
            const message = `Sincronização completa. ${createdCollections.length} coleções criadas. Usuário Admin: ${userCreated ? 'Criado' : 'Já existia'}.`;
            return sendSuccess(res, { userCreated, createdCollections, message });

        } catch (err: any) {
            console.error("Falha na configuração do banco de dados:", err);
            return sendError(res, `Falha na configuração do banco: ${err.message}`);
        }
    },
};