import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB, UserModel, GiftModel, TransactionModel, StreamerModel } from './database.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const anyApp = app as any;

// CORS aberto para facilitar conexão externa via IP
anyApp.use(cors({
    origin: '*',
    credentials: true
}));

anyApp.use(express.json());

// Conectar ao MongoDB
connectDB();

// --- ROTAS DA API ---

app.get('/api/health', (req: Request, res: Response) => {
    (res as any).json({ status: 'ok', message: 'LiveGo API is running' });
});

app.get('/api/users/me', async (req: Request, res: Response) => {
    try {
        let user = await UserModel.findOne({ id: 'me' });
        if (!user) {
            user = await UserModel.create({
                id: 'me',
                name: 'Admin User',
                avatarUrl: 'https://picsum.photos/seed/admin/200',
                diamonds: 10000,
                xp: 0,
                level: 1
            });
        }
        (res as any).json({ data: user });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

app.get('/api/gifts', async (req: Request, res: Response) => {
    try {
        const gifts = await GiftModel.find().sort({ price: 1 });
        (res as any).json({ data: gifts });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

app.post('/api/gifts/send', async (req: Request, res: Response) => {
    const { fromUserId, streamId, giftName, amount } = (req as any).body;
    try {
        const user = await UserModel.findOne({ id: fromUserId });
        const gift = await GiftModel.findOne({ name: giftName });
        const stream = await StreamerModel.findOne({ id: streamId });

        if (!user || !gift) {
            return (res as any).status(404).json({ error: 'Usuário ou presente não encontrado' });
        }

        const price = gift.price ?? 0;
        const totalCost = price * (amount || 1);

        if (user.diamonds < totalCost) {
            return (res as any).status(400).json({ error: 'Saldo insuficiente' });
        }

        user.diamonds -= totalCost;
        user.xp = (user.xp || 0) + totalCost;
        user.level = Math.floor(1 + user.xp / 1000);
        await user.save();

        // Registrar transação para o ranking
        await TransactionModel.create({
            userId: fromUserId,
            amount: totalCost,
            giftName: gift.name,
            streamId: streamId,
            receiverId: stream?.hostId || 'unknown',
            timestamp: new Date()
        });

        (res as any).json({ 
            data: { 
                success: true, 
                updatedSender: user,
                cost: totalCost 
            } 
        });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

// --- RANKINGS ---

app.get('/api/rankings/:period', async (req: Request, res: Response) => {
    const { period } = (req as any).params;
    let startDate = new Date();

    if (period === 'daily' || period === 'Diária') {
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly' || period === 'Semanal') {
        startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly' || period === 'Mensal') {
        startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'live' || period === 'Live') {
        startDate.setHours(startDate.getHours() - 4); // Últimas 4h
    } else {
        startDate.setFullYear(2020); // Tudo
    }

    try {
        const stats = await TransactionModel.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            { $group: { _id: "$userId", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 20 }
        ]);

        const rankedUsers = await Promise.all(stats.map(async (item) => {
            const u = await UserModel.findOne({ id: item._id });
            return {
                id: u?.id || item._id,
                name: u?.name || 'Usuário',
                avatarUrl: u?.avatarUrl || 'https://picsum.photos/seed/u/100',
                value: item.total,
                level: u?.level || 1
            };
        }));
        (res as any).json({ data: rankedUsers.filter(u => u.id) });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server running at http://0.0.0.0:${PORT}`);
});