import mongoose from 'mongoose';

// Configuração da URI do MongoDB com suporte a variável de ambiente de produção
export const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/livego';
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB Conectado: Sistema de Persistência Ativo");
        await seedGifts();
    } catch (err) {
        console.error("❌ Erro ao conectar no MongoDB:", err);
        if (process.env.NODE_ENV === 'production') process.exit(1);
    }
};

const seedGifts = async () => {
    try {
        const count = await GiftModel.countDocuments();
        if (count === 0) {
            const defaultGifts = [
                { id: 'gift-1', name: 'Coração', price: 1, icon: '❤️', category: 'Popular' },
                { id: 'gift-4', name: 'Rosa', price: 5, icon: '🌷', category: 'Popular' },
                { id: 'gift-9', name: 'Sinal de Luz do Ventilador', price: 10, icon: '🌟', category: 'Popular', triggersAutoFollow: true },
                { id: 'gift-88', name: 'Urso', price: 500, icon: '🧸', category: 'Luxo' },
                { id: 'gift-126', name: 'Foguete', price: 1000, icon: '🚀', category: 'VIP', triggersAutoFollow: true },
                { id: 'gift-133', name: 'Dragão', price: 5000, icon: '🐉', category: 'VIP' },
                { id: 'gift-102', name: 'Carro Esportivo', price: 8888, icon: '🏎️', category: 'Luxo' }
            ];
            await GiftModel.insertMany(defaultGifts);
            console.log("🎁 Banco de presentes semeado com sucesso!");
        }
    } catch (e) {
        console.error("Erro ao semear presentes:", e);
    }
};

// Schema de Usuário Robusto
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    identification: { type: String },
    name: { type: String, required: true },
    username: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String }, // Adicionado para Auth Real
    avatarUrl: { type: String },
    
    // Finanças: O coração do sistema de presentes
    diamonds: { type: Number, default: 5000 },          // Moedas para gastar
    earnings: { type: Number, default: 0 },            // Beans/Ganhos recebidos
    earnings_withdrawn: { type: Number, default: 0 },   // Total sacado histórico
    platformEarnings: { type: Number, default: 0 },     // Saldo de taxas (para admin)
    
    // Status e Gamificação
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    fans: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    isVIP: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    
    withdrawal_method: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

const GiftSchema = new mongoose.Schema({
    id: String,
    name: { type: String, unique: true },
    price: { type: Number, required: true },
    icon: String,
    category: String,
    triggersAutoFollow: { type: Boolean, default: false }
});

const StreamerSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    hostId: String,
    name: String,
    avatar: String,
    active: { type: Boolean, default: true },
    viewers: { type: Number, default: 0 },
    category: String,
    description: String,
    quality: { type: String, default: '720p' },
    tags: [String]
});

// Schema de Transação para Auditoria e Ranking
const TransactionSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userId: { type: String, required: true, index: true },   // Doador
    receiverId: { type: String, index: true },               // Recebedor
    streamId: { type: String },
    type: { 
        type: String, 
        required: true, 
        enum: ['gift', 'withdrawal', 'recharge', 'platform_fee'] 
    },
    status: { 
        type: String, 
        enum: ['Pendente', 'Concluído', 'Cancelado'], 
        default: 'Concluído' 
    },
    amountCoins: { type: Number, default: 0 },      // Valor em diamantes/beans
    amountBRL: { type: Number, default: 0 },        // Valor monetário real
    giftName: { type: String },
    quantity: { type: Number, default: 1 },
    description: { type: String },
    relatedUserId: { type: String },
    timestamp: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model('User', UserSchema);
export const GiftModel = mongoose.model('Gift', GiftSchema);
export const StreamerModel = mongoose.model('Streamer', StreamerSchema);
export const TransactionModel = mongoose.model('Transaction', TransactionSchema);