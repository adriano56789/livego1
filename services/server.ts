
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { 
    connectDB, 
    UserModel, 
    StreamerModel, 
    GiftModel, 
    TransactionModel, 
} from './database';
// Fix: Import CURRENT_USER_ID from db_shared as it is not exported from database.ts
import { CURRENT_USER_ID } from './db_shared';
import { dbConfig } from './config';

// Declare globals for Node
declare var require: any;
declare var module: any;

// Inicialização do App Express
const app = express();

// Fix: Use 'as any' for app to bypass typing issues with middleware calls like use() when they expect 0 arguments
const anyApp = app as any;
anyApp.use(cors());
anyApp.use(express.json());

// Middleware para garantir conexão
app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) {
        return (res as any).status(503).json({ error: 'Database not connected' });
    }
    next();
});

// Helper de Nível
const getLevelFromXP = (xp: number) => {
    // Lógica simples: Nível = 1 + XP / 1000
    return Math.floor(1 + xp / 1000);
};

// --- Rotas Reais ---

// 1. Get Current User (Simulado 'me' ou pegar do header em auth real)
app.get('/api/users/me', async (req, res) => {
    try {
        let user = await UserModel.findOne({ id: CURRENT_USER_ID });
        
        if (!user) {
            user = await UserModel.create({
                id: CURRENT_USER_ID,
                name: 'Você',
                username: 'voce_real',
                avatarUrl: 'https://picsum.photos/seed/me/200',
                coverUrl: 'https://picsum.photos/seed/cover/800/600',
                diamonds: 5000,
                level: 12,
                earnings: 0
            });
        }
        res.json({ data: user });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 2. Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.json({ data: users });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 3. Get User by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await UserModel.findOne({ id: req.params.id });
        if (!user) return (res as any).status(404).json({ error: 'User not found' });
        res.json({ data: user });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 4. Update Profile
app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await UserModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json({ data: { success: true, user } });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 5. Gifts
app.get('/api/gifts', async (req, res) => {
    try {
        let gifts = await GiftModel.find();
        // Se vazio, popula com defaults (apenas uma vez)
        if (gifts.length === 0) {
            const defaultGifts = [
                { id: '1', name: 'Coração', price: 1, icon: '❤️', category: 'Popular' },
                { id: '2', name: 'Café', price: 3, icon: '☕', category: 'Popular' },
                { id: '9', name: 'Sinal de Luz do Ventilador', price: 10, icon: '🌟', category: 'Popular', triggersAutoFollow: true },
                { id: '60', name: 'Foguete', price: 500, icon: '🚀', category: 'VIP' }
            ];
            gifts = await GiftModel.insertMany(defaultGifts) as any;
        }
        res.json({ data: gifts });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 6. Send Gift (Lógica completa)
app.post('/api/gifts/send', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fromUserId, streamId, giftName, amount } = req.body;
        
        const gift = await GiftModel.findOne({ name: giftName });
        if (!gift) throw new Error('Gift not found');

        const sender = await UserModel.findOne({ id: fromUserId }).session(session);
        if (!sender) throw new Error('Sender not found');

        const totalCost = gift.price * amount;
        if (sender.diamonds < totalCost) throw new Error('Insufficient diamonds');

        // 1. Deduct from Sender
        sender.diamonds -= totalCost;
        sender.xp = (sender.xp || 0) + totalCost;
        sender.level = getLevelFromXP(sender.xp);
        
        // 2. Add to Receiver (Streamer)
        const stream = await StreamerModel.findOne({ id: streamId }).session(session);
        let updatedReceiver = null;
        
        if (stream) {
            const receiver = await UserModel.findOne({ id: stream.hostId }).session(session);
            if (receiver) {
                // Earnings logic
                receiver.earnings += totalCost;
                receiver.xp = (receiver.xp || 0) + totalCost;
                receiver.level = getLevelFromXP(receiver.xp);
                
                // Fan Club Logic
                if (gift.name === 'Sinal de Luz do Ventilador') {
                    // Se não tiver fã clube, cria (simulado na estrutura do usuário)
                    // No MongoDB real, teríamos uma collection FanClubMembers
                    // Aqui, simulamos setando no sender
                    // Em um app real, verificaríamos se já é fã
                }

                // Auto Follow Logic
                if (gift.triggersAutoFollow) {
                    // Aqui entraria a lógica de follow (adicionar na lista de followers do receiver e following do sender)
                    receiver.fans = (receiver.fans || 0) + 1;
                    sender.following = (sender.following || 0) + 1;
                }

                await receiver.save({ session });
                updatedReceiver = receiver;
            }
        }

        await sender.save({ session });

        // 3. Record Transaction
        await TransactionModel.create([{
            id: `tx-${Date.now()}`,
            userId: sender.id,
            type: 'gift_sent',
            amountCoins: totalCost,
            description: `Sent ${amount}x ${gift.name}`,
            status: 'Concluído',
            relatedUserId: updatedReceiver ? updatedReceiver.id : undefined
        }], { session });

        await session.commitTransaction();
        res.json({ data: { success: true, updatedSender: sender, updatedReceiver } });

    } catch (e: any) {
        await session.abortTransaction();
        (res as any).status(400).json({ error: e.message });
    } finally {
        session.endSession();
    }
});

// 7. Wallet Data
app.get('/api/wallet', async (req, res) => {
    try {
        const user = await UserModel.findOne({ id: CURRENT_USER_ID });
        if (!user) throw new Error('User not found');
        
        // Simples lógica de conversão
        const rate = 7.00 / 800;
        const gross = user.earnings * rate;
        const fee = gross * 0.20;
        const net = gross * 0.80;

        res.json({ 
            data: {
                userId: user.id,
                balance: user.earnings,
                currency: 'BRL',
                diamonds: user.diamonds,
                userEarnings: {
                    available_diamonds: user.earnings,
                    gross_brl: parseFloat(gross.toFixed(2)),
                    platform_fee_brl: parseFloat(fee.toFixed(2)),
                    net_brl: parseFloat(net.toFixed(2))
                }
            } 
        });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 8. Streams
app.get('/api/streams', async (req, res) => {
    try {
        const streams = await StreamerModel.find({ active: true });
        res.json({ data: streams });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

app.post('/api/streams', async (req, res) => {
    try {
        const newStream = await StreamerModel.create({
            id: `stream-${Date.now()}`,
            ...req.body,
            viewers: 0,
            active: true
        });
        
        // Atualiza status do usuário
        await UserModel.findOneAndUpdate({ id: req.body.hostId }, { isLive: true });
        
        res.json({ data: newStream });
    } catch (e: any) {
        (res as any).status(500).json({ error: e.message });
    }
});

// 9. Withdraw
app.post('/api/wallet/withdraw', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount } = req.body;
        const user = await UserModel.findOne({ id: CURRENT_USER_ID }).session(session);
        
        if (!user) throw new Error('User not found');
        if (user.earnings < amount) throw new Error('Insufficient earnings');

        user.earnings -= amount;
        user.earnings_withdrawn += amount;
        await user.save({ session });

        const rate = 7.00 / 800;
        const gross = amount * rate;
        const net = gross * 0.80;

        const record = await TransactionModel.create([{
            id: `withdraw-${Date.now()}`,
            userId: user.id,
            type: 'withdraw',
            amountCoins: amount,
            amountBRL: parseFloat(net.toFixed(2)),
            status: 'Pendente',
            description: 'Saque de Ganhos'
        }], { session });

        await session.commitTransaction();
        res.json({ data: { success: true, message: 'Withdrawal requested', record: record[0] } });
    } catch (e: any) {
        await session.abortTransaction();
        (res as any).status(400).json({ error: e.message });
    } finally {
        session.endSession();
    }
});

// --- Inicialização do Servidor ---

const startServer = async () => {
    await connectDB();
    // Fix: Ensure port is a number
    const port = typeof dbConfig.server.port === 'string' ? parseInt(dbConfig.server.port, 10) : dbConfig.server.port;
    // Fix: Cast app to any before calling listen to accept multi-parameter calls in restricted environments
    (app as any).listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running strictly on MongoDB at http://0.0.0.0:${port}`);
    });
};

// Inicia se for executado diretamente
if (require.main === module) {
    startServer();
}

export const mockApiRouter = async (method: string, path: string, body?: any) => {
    throw new Error("mockApiRouter is disabled. Use real HTTP calls.");
};
