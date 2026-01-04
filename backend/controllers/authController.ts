import { UserModel } from '../models/User';
import { config } from '../config/settings';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/response';

export const authController = {
    register: async (req: any, res: any, next: any) => {
        try {
            const { name, email, password } = req.body;
            
            if (!name || !email || !password) {
                return sendError(res, "Todos os campos são obrigatórios.", 400);
            }

            const normalizedEmail = email.toLowerCase().trim();
            const userExists = await UserModel.findOne({ email: normalizedEmail });
            
            if (userExists) {
                return sendError(res, "Este e-mail já possui cadastro.", 400);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const identification = Math.floor(10000000 + Math.random() * 90000000).toString();
            
            const newUser = await UserModel.create({
                id: `u-${Date.now()}`,
                identification,
                name,
                email: normalizedEmail,
                password: hashedPassword,
                avatarUrl: `https://picsum.photos/seed/${identification}/200`,
                coverUrl: `https://picsum.photos/seed/${identification}-c/1080/1920`
            });

            return sendSuccess(res, newUser, "Usuário registrado com sucesso no banco real.", 201);
        } catch (error: any) {
            next(error);
        }
    },

    login: async (req: any, res: any, next: any) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) return sendError(res, "E-mail e senha são obrigatórios.", 400);

            const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
            if (!user) return sendError(res, "Usuário não encontrado.", 401);

            const isPasswordValid = await bcrypt.compare(password, (user as any).password);
            if (!isPasswordValid) return sendError(res, "Senha incorreta.", 401);
            
            await UserModel.updateOne({ _id: (user as any)._id }, { isOnline: true });
            
            const token = jwt.sign(
                { userId: (user as any).id, email: (user as any).email },
                config.jwtSecret,
                { expiresIn: '7d' }
            );

            // O transformador no Model já cuidará de remover a senha automaticamente
            return sendSuccess(res, { user, token }, "Login realizado com sucesso.");
        } catch (error: any) {
            next(error);
        }
    },

    logout: async (req: any, res: any, next: any) => {
        try {
            const { userId } = req.body;
            if (userId) {
                await UserModel.findOneAndUpdate({ id: userId }, { isOnline: false });
            }
            return sendSuccess(res, null, "Sessão encerrada.");
        } catch (error) {
            next(error);
        }
    }
};