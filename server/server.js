"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_js_1 = require("./database.js");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Configurações Globais
const anyApp = app;
anyApp.use((0, cors_1.default)({ origin: '*', credentials: true }));
anyApp.use(express_1.default.json());
// Conexão com o Banco
(0, database_js_1.connectDB)();
// --- HELPERS ---
const calculateLevel = (xp) => Math.floor(1 + (xp / 1000));
const getMe = async () => {
    // Retorna o primeiro usuário online ou cria um admin padrão se não houver ninguém
    let me = await database_js_1.UserModel.findOne({ isOnline: true }).sort({ createdAt: -1 });
    if (!me) {
        me = await database_js_1.UserModel.findOne({ id: 'me' });
        if (!me) {
            me = await database_js_1.UserModel.create({
                id: 'me',
                identification: '88776655',
                name: 'Admin LiveGo',
                username: 'admin',
                diamonds: 10000,
                isOnline: true
            });
        }
    }
    return me;
};
// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await database_js_1.UserModel.findOne({ email });
        if (existing)
            return res.status(400).json({ error: 'E-mail já cadastrado.' });
        const userId = `u-${Date.now()}`;
        const identification = Math.floor(10000000 + Math.random() * 90000000).toString();
        const newUser = await database_js_1.UserModel.create({
            id: userId,
            identification,
            name,
            email,
            password,
            diamonds: 1000,
            isOnline: true
        });
        res.json({ data: { success: true, user: newUser } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database_js_1.UserModel.findOne({ email, password });
        if (!user)
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        user.isOnline = true;
        await user.save();
        res.json({ data: { success: true, user } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/auth/logout', async (req, res) => {
    try {
        const me = await getMe();
        if (me) {
            me.isOnline = false;
            await me.save();
        }
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- USERS ---
app.get('/api/users/me', async (req, res) => {
    try {
        const user = await getMe();
        res.json({ data: user });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const users = await database_js_1.UserModel.find().limit(50);
        res.json({ data: users });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await database_js_1.UserModel.findOne({ id: req.params.id });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json({ data: user });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await database_js_1.UserModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json({ data: { success: true, user } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/users/:id', async (req, res) => {
    try {
        await database_js_1.UserModel.deleteOne({ id: req.params.id });
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- RELATIONSHIPS ---
app.post('/api/users/:id/toggle-follow', async (req, res) => {
    try {
        const me = await getMe();
        const targetId = req.params.id;
        const target = await database_js_1.UserModel.findOne({ id: targetId });
        if (!target)
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        const isFollowing = me.followingIds.includes(targetId);
        if (isFollowing) {
            me.followingIds = me.followingIds.filter((id) => id !== targetId);
            me.following--;
            target.fans--;
        }
        else {
            me.followingIds.push(targetId);
            me.following++;
            target.fans++;
        }
        await me.save();
        await target.save();
        res.json({ data: { success: true, isFollowing: !isFollowing, updatedUser: target } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:id/fans', async (req, res) => {
    try {
        const users = await database_js_1.UserModel.find({ followingIds: req.params.id });
        res.json({ data: users });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:id/following', async (req, res) => {
    try {
        const user = await database_js_1.UserModel.findOne({ id: req.params.id });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        const following = await database_js_1.UserModel.find({ id: { $in: user.followingIds } });
        res.json({ data: following });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:id/friends', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await database_js_1.UserModel.findOne({ id: userId });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        // Amigos são aqueles que se seguem mutuamente
        const friends = await database_js_1.UserModel.find({
            id: { $in: user.followingIds },
            followingIds: userId
        });
        res.json({ data: friends });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/me/blocklist', async (req, res) => {
    try {
        const me = await getMe();
        const blocked = await database_js_1.UserModel.find({ id: { $in: me.blockedIds } });
        res.json({ data: blocked });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/users/:id/block', async (req, res) => {
    try {
        const me = await getMe();
        if (!me.blockedIds.includes(req.params.id)) {
            me.blockedIds.push(req.params.id);
            await me.save();
        }
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/users/:id/unblock', async (req, res) => {
    try {
        const me = await getMe();
        me.blockedIds = me.blockedIds.filter((id) => id !== req.params.id);
        await me.save();
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/users/:id/report', async (req, res) => {
    try {
        const me = await getMe();
        const { reason, description } = req.body;
        await database_js_1.ReportModel.create({
            reporterId: me.id,
            targetId: req.params.id,
            reason,
            description
        });
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:id/status', async (req, res) => {
    try {
        const user = await database_js_1.UserModel.findOne({ id: req.params.id });
        res.json({ data: { id: req.params.id, isOnline: user?.isOnline || false } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/user/statusChanged', async (req, res) => {
    try {
        const { online } = req.body;
        const me = await getMe();
        me.isOnline = online;
        await me.save();
        res.json({ data: { success: true, user: me } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- STREAMING ---
app.get('/api/live/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const country = req.query.country;
        let query = { active: true };
        if (category !== 'all' && category !== 'popular') {
            query.category = { $regex: new RegExp(category, 'i') };
        }
        if (country && country !== 'ICON_GLOBE') {
            // No modelo real, precisaríamos popular o Host e checar o país
            // Simplificando: o país está no modelo Streamer como cache
            query.country = country;
        }
        const streams = await database_js_1.StreamerModel.find(query).sort({ viewers: -1 });
        res.json({ data: streams });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/streams', async (req, res) => {
    try {
        const stream = await database_js_1.StreamerModel.create({
            id: `str-${Date.now()}`,
            ...req.body,
            active: true,
            status: 'created',
            startedAt: new Date()
        });
        await database_js_1.UserModel.findOneAndUpdate({ id: req.body.hostId }, { isLive: true });
        res.json({ data: stream });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.put('/api/streams/:id', async (req, res) => {
    try {
        const stream = await database_js_1.StreamerModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json({ data: { success: true, stream } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/streams/:id/start', async (req, res) => {
    try {
        const stream = await database_js_1.StreamerModel.findOneAndUpdate({ id: req.params.id }, { status: 'live', active: true }, { new: true });
        res.json({ data: { success: true, stream } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/streams/:id/end', async (req, res) => {
    try {
        const stream = await database_js_1.StreamerModel.findOneAndUpdate({ id: req.params.id }, { status: 'ended', active: false, endedAt: new Date() }, { new: true });
        if (stream)
            await database_js_1.UserModel.findOneAndUpdate({ id: stream.hostId }, { isLive: false });
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/streams/:id/leave', async (req, res) => {
    try {
        // Lógica de decrementar viewers
        await database_js_1.StreamerModel.findOneAndUpdate({ id: req.params.id }, { $inc: { viewers: -1 } });
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/streams/:id/users', async (req, res) => {
    try {
        // Simulando lista de usuários na sala
        const users = await database_js_1.UserModel.find({ isOnline: true }).limit(10);
        const data = users.map(u => ({ ...u.toObject(), value: Math.floor(Math.random() * 1000) }));
        res.json({ data });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/streams/:id/quality', async (req, res) => {
    try {
        const { quality } = req.body;
        const stream = await database_js_1.StreamerModel.findOneAndUpdate({ id: req.params.id }, { quality }, { new: true });
        res.json({ data: { success: true, stream } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- GIFTS ---
app.get('/api/gifts', async (req, res) => {
    try {
        const gifts = await database_js_1.GiftModel.find();
        res.json({ data: gifts });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/streams/:streamId/gift', async (req, res) => {
    try {
        const { fromUserId, giftName, amount } = req.body;
        const { streamId } = req.params;
        const sender = await database_js_1.UserModel.findOne({ id: fromUserId });
        const gift = await database_js_1.GiftModel.findOne({ name: giftName });
        const stream = await database_js_1.StreamerModel.findOne({ id: streamId });
        if (!sender || !gift || !stream)
            return res.status(404).json({ error: 'Dados inválidos.' });
        const giftPrice = gift.price ?? 0; // Handle null/undefined with nullish coalescing
        const totalCost = giftPrice * (amount || 1);
        if (sender.diamonds < totalCost)
            return res.status(400).json({ error: 'Saldo insuficiente.' });
        // 1. Deduz saldo e sobe XP
        sender.diamonds -= totalCost;
        sender.xp += totalCost;
        sender.level = calculateLevel(sender.xp);
        await sender.save();
        // 2. Credita ganhos ao host (80%)
        const host = await database_js_1.UserModel.findOne({ id: stream.hostId });
        if (host) {
            const platformFee = totalCost * 0.20;
            host.earnings += (totalCost - platformFee);
            host.platformEarnings = (host.platformEarnings || 0) + platformFee;
            await host.save();
        }
        // 3. Registra Transação
        await database_js_1.TransactionModel.create({
            id: `tx-${Date.now()}`,
            userId: fromUserId,
            receiverId: stream.hostId,
            streamId: streamId,
            type: 'gift',
            status: 'Concluído',
            amountCoins: totalCost,
            giftName: gift.name,
            quantity: amount,
            description: `Presente ${gift.name} enviado`
        });
        res.json({ data: { success: true, updatedSender: sender, cost: totalCost } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:userId/received-gifts', async (req, res) => {
    try {
        const gifts = await database_js_1.TransactionModel.aggregate([
            { $match: { receiverId: req.params.userId, type: 'gift' } },
            { $group: { _id: "$giftName", count: { $sum: "$quantity" } } }
        ]);
        // Populando dados visuais
        const detailedGifts = await Promise.all(gifts.map(async (g) => {
            const detail = await database_js_1.GiftModel.findOne({ name: g._id });
            return { ...detail?.toObject(), count: g.count };
        }));
        res.json({ data: detailedGifts });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- WALLET ---
app.get('/api/wallets/:userId', async (req, res) => {
    try {
        const user = await database_js_1.UserModel.findOne({ id: req.params.userId });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        const history = await database_js_1.TransactionModel.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        // Lógica de conversão real
        const rate = 7.00 / 800;
        const gross = user.earnings * rate;
        const platformFee = gross * 0.20;
        const net = gross * 0.80;
        res.json({ data: {
                userId: user.id,
                balance: user.earnings,
                diamonds: user.diamonds,
                userEarnings: {
                    available_diamonds: user.earnings,
                    gross_brl: parseFloat(gross.toFixed(2)),
                    platform_fee_brl: parseFloat(platformFee.toFixed(2)),
                    net_brl: parseFloat(net.toFixed(2))
                },
                history
            } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/users/:userId/buy-diamonds', async (req, res) => {
    try {
        const { diamonds, price } = req.body;
        const user = await database_js_1.UserModel.findOneAndUpdate({ id: req.params.userId }, { $inc: { diamonds: diamonds } }, { new: true });
        await database_js_1.TransactionModel.create({
            id: `buy-${Date.now()}`,
            userId: req.params.userId,
            type: 'recharge',
            status: 'Concluído',
            amountCoins: diamonds,
            amountBRL: price,
            description: 'Compra de Diamantes'
        });
        res.json({ data: { success: true, user } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/wallet/withdraw', async (req, res) => {
    try {
        const { amount } = req.body;
        const me = await getMe();
        if (me.earnings < amount)
            return res.status(400).json({ error: 'Saldo de ganhos insuficiente.' });
        me.earnings -= amount;
        me.earnings_withdrawn += amount;
        await me.save();
        const record = await database_js_1.TransactionModel.create({
            id: `wdr-${Date.now()}`,
            userId: me.id,
            type: 'withdrawal',
            status: 'Pendente',
            amountCoins: amount,
            description: 'Saque solicitado'
        });
        res.json({ data: { success: true, record, message: 'Solicitação de saque enviada.' } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- CHAT ---
app.get('/api/chats/:otherUserId/messages', async (req, res) => {
    try {
        const me = await getMe();
        const messages = await database_js_1.MessageModel.find({
            $or: [
                { from: me.id, to: req.params.otherUserId },
                { from: req.params.otherUserId, to: me.id }
            ]
        }).sort({ timestamp: 1 });
        res.json({ data: messages });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/chats/:otherUserId/messages', async (req, res) => {
    try {
        const me = await getMe();
        const msg = await database_js_1.MessageModel.create({
            id: `msg-${Date.now()}`,
            from: me.id,
            to: req.params.otherUserId,
            text: req.body.text,
            status: 'sent'
        });
        res.json({ data: msg });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/chats/:otherUserId/mark-read', async (req, res) => {
    try {
        const me = await getMe();
        await database_js_1.MessageModel.updateMany({ from: req.params.otherUserId, to: me.id, status: { $ne: 'read' } }, { $set: { status: 'read' } });
        res.json({ data: { success: true } });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/users/:userId/messages', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await database_js_1.MessageModel.aggregate([
            { $match: { $or: [{ from: userId }, { to: userId }] } },
            { $sort: { timestamp: -1 } },
            { $group: {
                    _id: { $cond: [{ $eq: ["$from", userId] }, "$to", "$from"] },
                    lastMessage: { $first: "$text" },
                    timestamp: { $first: "$timestamp" },
                    unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$to", userId] }, { $ne: ["$status", "read"] }] }, 1, 0] } }
                } }
        ]);
        const detailed = await Promise.all(conversations.map(async (c) => {
            const friend = await database_js_1.UserModel.findOne({ id: c._id });
            return friend ? { id: c._id, friend, lastMessage: c.lastMessage, timestamp: c.timestamp, unreadCount: c.unreadCount } : null;
        }));
        res.json({ data: detailed.filter(d => d !== null) });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// --- OUTROS ---
app.post('/api/translate', async (req, res) => {
    // Simulação de tradução
    res.json({ data: { translatedText: req.body.text } });
});
app.get('/api/rankings/:period', async (req, res) => {
    try {
        // Simulando ranking baseado em XP/Ganhos
        const users = await database_js_1.UserModel.find().sort({ xp: -1 }).limit(20);
        const data = users.map((u, i) => ({ ...u.toObject(), value: u.xp, rank: i + 1 }));
        res.json({ data });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LiveGo Real Server ativo na porta ${PORT}`);
});
