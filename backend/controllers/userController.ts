
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const userController = {
    getMe: async (req: AuthRequest, res: any) => {
        try {
            const user = await UserModel.findOne({ id: req.userId });
            if (!user) return sendError(res, "Sessão inválida.", 404);
            return sendSuccess(res, user);
        } catch (err) {
            return sendError(res, "Erro ao processar dados.");
        }
    },

    getUser: async (req: any, res: any) => {
        try {
            const user = await UserModel.findOne({ id: req.params.id });
            if (!user) return sendError(res, "Perfil não encontrado.", 404);
            return sendSuccess(res, user);
        } catch (err) {
            return sendError(res, "Falha na consulta.");
        }
    },

    getOnlineUsers: async (req: any, res: any) => {
        try {
            const users = await UserModel.find({ isOnline: true }).limit(50);
            return sendSuccess(res, users);
        } catch (err) {
            return sendError(res, "Erro ao recuperar usuários.");
        }
    },

    updateBillingAddress: async (req: AuthRequest, res: any) => {
        try {
            const updated = await UserModel.findOneAndUpdate(
                { id: req.userId },
                { billingAddress: req.body },
                { new: true }
            );
            return sendSuccess(res, updated, "Endereço atualizado.");
        } catch (err) {
            return sendError(res, "Erro ao salvar endereço.");
        }
    },

    updateCreditCard: async (req: AuthRequest, res: any) => {
        try {
            const { number, brand, expiry } = req.body;
            // Salva apenas os 4 últimos dígitos por segurança (PCI Compliance Simulado)
            const cardData = {
                last4: number ? number.slice(-4) : '****',
                brand: brand || 'Visa',
                expiry: expiry
            };
            const updated = await UserModel.findOneAndUpdate(
                { id: req.userId },
                { creditCardInfo: cardData },
                { new: true }
            );
            return sendSuccess(res, updated, "Cartão vinculado.");
        } catch (err) {
            return sendError(res, "Erro ao salvar cartão.");
        }
    },

    follow: async (req: AuthRequest, res: any) => {
        try {
            const targetId = req.params.id;
            const myId = req.userId;
            const updatedMe = await UserModel.findOneAndUpdate(
                { id: myId },
                { $addToSet: { followingIds: targetId }, $inc: { following: 1 } },
                { new: true }
            );
            await UserModel.findOneAndUpdate({ id: targetId }, { $inc: { fans: 1 } });
            return sendSuccess(res, updatedMe);
        } catch (err) {
            return sendError(res, "Erro ao seguir.");
        }
    }
};
