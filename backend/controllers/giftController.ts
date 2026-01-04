import { GiftModel } from '../models/Gift';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const giftController = {
    getAll: async (req: any, res: any, next: any) => {
        try {
            const { category } = req.query;
            const query = category ? { category } : {};
            const gifts = await GiftModel.find(query).sort({ price: 1 });
            return sendSuccess(res, gifts);
        } catch (err: any) {
            next(err);
        }
    },

    sendGift: async (req: AuthRequest, res: any, next: any) => {
        try {
            const { giftName, amount, toUserId } = req.body;
            const fromUserId = req.userId; 

            const sender = await UserModel.findOne({ id: fromUserId });
            const gift = await GiftModel.findOne({ name: giftName });

            if (!sender || !gift) return sendError(res, "Dados de transação inválidos.", 404);

            const totalCost = gift.price * amount;
            if ((sender as any).diamonds < totalCost) {
                return sendError(res, "Saldo de diamantes insuficiente.", 400);
            }

            const updatedSender = await UserModel.findOneAndUpdate(
                { id: fromUserId },
                { $inc: { diamonds: -totalCost, xp: totalCost } },
                { new: true }
            );

            if (toUserId) {
                const earningsForReceiver = Math.floor(totalCost * 0.5);
                await UserModel.findOneAndUpdate(
                    { id: toUserId },
                    { $inc: { earnings: earningsForReceiver } }
                );
            }

            await TransactionModel.create({
                id: `gift-${Date.now()}`,
                userId: fromUserId,
                type: 'gift',
                amountDiamonds: totalCost,
                status: 'completed',
                details: { giftName, recipientId: toUserId, quantity: amount }
            });

            return sendSuccess(res, updatedSender, "Presente enviado com sucesso.");
        } catch (error: any) {
            next(error);
        }
    }
};