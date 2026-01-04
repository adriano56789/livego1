
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const walletController = {
    getBalance: async (req: AuthRequest, res: any) => {
        try {
            const user = await UserModel.findOne({ id: req.userId });
            if (!user) return sendError(res, "Usuário não encontrado", 404);
            
            const earnings = (user as any).earnings || 0;
            return sendSuccess(res, { 
                diamonds: (user as any).diamonds || 0,
                earnings: earnings,
                userEarnings: {
                    available_diamonds: earnings,
                    gross_brl: earnings * 0.05,
                    platform_fee_brl: (earnings * 0.05) * 0.20,
                    net_brl: (earnings * 0.05) * 0.80
                }
            });
        } catch (err: any) {
            return sendError(res, "Erro ao consultar saldo.");
        }
    },

    confirmPurchase: async (req: AuthRequest, res: any) => {
        try {
            const { details, method } = req.body;
            const { diamonds, price } = details;

            const transaction = await TransactionModel.create({
                id: `buy-${Date.now()}`,
                userId: req.userId,
                type: 'recharge',
                amountDiamonds: diamonds,
                amountBRL: price,
                status: 'completed',
                details: { method, date: new Date() }
            });

            const updatedUser = await UserModel.findOneAndUpdate(
                { id: req.userId },
                { $inc: { diamonds: diamonds } },
                { new: true }
            );

            // Retorna array para bater com o .length > 0 do frontend
            return sendSuccess(res, [{ success: true, transactionId: transaction.id, user: updatedUser }]);
        } catch (err) {
            return sendError(res, "Falha ao confirmar compra.");
        }
    },

    cancelPurchase: async (req: AuthRequest, res: any) => {
        try {
            return sendSuccess(res, { message: "Transação cancelada." });
        } catch (err) {
            return sendError(res, "Erro ao cancelar.");
        }
    },

    recharge: async (req: AuthRequest, res: any) => {
        // Fallback para rota antiga de compra direta
        const { diamonds } = req.body;
        const updatedUser = await UserModel.findOneAndUpdate(
            { id: req.userId },
            { $inc: { diamonds: diamonds } },
            { new: true }
        );
        return sendSuccess(res, updatedUser);
    }
};
