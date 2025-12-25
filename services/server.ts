import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB, UserModel, GiftModel, TransactionModel, StreamerModel } from './database.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const anyApp = app as any;
anyApp.use(cors({ origin: '*', credentials: true }));
anyApp.use(express.json());

connectDB();

// Helper para nível: 1000 XP por nível
const calculateLevel = (xp: number) => Math.floor(1 + (xp / 1000));

// --- ROTAS DE USUÁRIO ---

app.get('/api/users/me', async (req: Request, res: Response) => {
    try {
        let user = await UserModel.findOne({ id: 'me' });
        if (!user) {
            user = await UserModel.create({
                id: 'me',
                name: 'Admin User',
                avatarUrl: 'https://picsum.photos/seed/admin/200',
                diamonds: 10000,
                isVIP: true
            });
        }
        (res as any).json({ data: user });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

// Busca a galeria de presentes recebidos pelo streamer
app.get('/api/users/:id/gifts/received', async (req: Request, res: Response) => {
    try {
        const { id } = (req as any).params;
        const transactions = await TransactionModel.aggregate([
            { $match: { receiverId: id, type: 'gift', status: 'Concluído' } },
            { $group: { _id: "$giftName", count: { $sum: "$quantity" } } }
        ]);

        const allGifts = await GiftModel.find();
        const data = transactions.map(t => {
            const giftInfo = allGifts.find(g => g.name === t._id);
            return {
                id: giftInfo?.id || t._id,
                name: t._id,
                count: t.count,
                icon: giftInfo?.icon || '🎁',
                category: giftInfo?.category || 'Popular'
            };
        });

        (res as any).json({ data });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

// --- CARTEIRA E SAQUE ---

app.get('/api/wallet', async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findOne({ id: 'me' });
        if (!user) return (res as any).status(404).json({ error: 'User not found' });

        // Beans -> BRL: 800 diamantes = 7 reais
        const rate = 7.00 / 800;
        const gross = user.earnings * rate;
        const fee = gross * 0.20; // 20% taxa
        const net = gross * 0.80; // 80% streamer

        (res as any).json({ 
            data: {
                diamonds: user.diamonds,
                earnings: user.earnings,
                userEarnings: {
                    available_diamonds: user.earnings,
                    gross_brl: gross,
                    platform_fee_brl: fee,
                    net_brl: net
                }
            } 
        });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

app.post('/api/wallet/withdraw', async (req: Request, res: Response) => {
    const { amount, method } = (req as any).body;
    try {
        const user = await UserModel.findOne({ id: 'me' });
        if (!user || user.earnings < amount) {
            return (res as any).status(400).json({ error: 'Saldo insuficiente' });
        }

        const rate = 7.00 / 800;
        const grossValue = amount * rate;
        const netValue = grossValue * 0.80;
        const platformFee = grossValue * 0.20;

        // Deduz saldo de ganhos e registra retirada
        user.earnings -= amount;
        user.earnings_withdrawn += amount;
        // Atribui a taxa para o balanço do admin (me) para fins de simulação
        user.platformEarnings += platformFee;
        await user.save();

        const record = await TransactionModel.create({
            id: `wd-${Date.now()}`,
            userId: 'me',
            type: 'withdrawal',
            status: 'Pendente',
            amountCoins: amount,
            amountBRL: netValue,
            description: `Saque PIX para ${method?.details?.key || 'chave padrão'}`,
            timestamp: new Date()
        });

        (res as any).json({ data: { success: true, record, message: 'Saque solicitado. Aguarde 24h.' } });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

// --- SISTEMA DE PRESENTES ---

app.post('/api/gifts/send', async (req: Request, res: Response) => {
    const { fromUserId, streamId, giftName, amount } = (req as any).body;
    try {
        const sender = await UserModel.findOne({ id: fromUserId });
        const gift = await GiftModel.findOne({ name: giftName });
        const stream = await StreamerModel.findOne({ id: streamId });

        if (!sender || !gift) {
            return (res as any).status(404).json({ error: 'Dados inválidos' });
        }

        const quantity = amount || 1;
        const giftPrice = gift?.price ?? 0; // Handle null/undefined with optional chaining and nullish coalescing
        const totalCost = giftPrice * quantity;

        if (sender.diamonds < totalCost) {
            return (res as any).status(400).json({ error: 'Diamantes insuficientes' });
        }

        // 1. Atualiza Doador (Debita saldo e adiciona XP)
        sender.diamonds -= totalCost;
        sender.xp += totalCost;
        sender.level = calculateLevel(sender.xp);
        await sender.save();

        // 2. Atualiza Recebedor (Credita saldo de ganhos)
        const receiverId = stream?.hostId || 'unknown';
        if (receiverId !== 'unknown') {
            const receiver = await UserModel.findOne({ id: receiverId });
            if (receiver) {
                receiver.earnings += totalCost;
                await receiver.save();
            }
        }

        // 3. Registra a Transação
        await TransactionModel.create({
            id: `gt-${Date.now()}-${sender.id}`,
            userId: fromUserId,
            receiverId: receiverId,
            streamId: streamId,
            type: 'gift',
            status: 'Concluído',
            amountCoins: totalCost,
            quantity: quantity,
            giftName: gift.name,
            timestamp: new Date()
        });

        (res as any).json({ 
            data: { 
                success: true, 
                updatedSender: sender,
                cost: totalCost 
            } 
        });
    } catch (error: any) {
        (res as any).status(500).json({ error: error.message });
    }
});

// --- RANKING POR PERÍODO ---

app.get('/api/rankings/:period', async (req: Request, res: Response) => {
    const { period } = (req as any).params;
    let startDate = new Date();

    if (period === 'daily' || period === 'Diária') startDate.setHours(0,0,0,0);
    else if (period === 'weekly' || period === 'Semanal') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'monthly' || period === 'Mensal') startDate.setMonth(startDate.getMonth() - 1);
    else startDate.setHours(startDate.getHours() - 6); // Live (6h)

    try {
        const stats = await TransactionModel.aggregate([
            { $match: { timestamp: { $gte: startDate }, type: 'gift', status: 'Concluído' } },
            { $group: { _id: "$userId", total: { $sum: "$amountCoins" } } },
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
    console.log(`🚀 API LiveGo Ativa em http://0.0.0.0:${PORT}`);
});