import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://72.60.249.175:27017/livego?authSource=admin';
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB Conectado");
        await seedGifts();
    } catch (err) {
        console.error("❌ Erro MongoDB:", err);
    }
};

const seedGifts = async () => {
    try {
        const count = await GiftModel.countDocuments();
        if (count === 0) {
            const defaultGifts = [
                { id: '1', name: 'Coração', price: 1, icon: '❤️', category: 'Popular' },
                { id: '4', name: 'Rosa', price: 5, icon: '🌷', category: 'Popular' },
                { id: '9', name: 'Sinal de Luz do Ventilador', price: 10, icon: '🌟', category: 'Popular' },
                { id: '88', name: 'Urso', price: 500, icon: '🧸', category: 'Luxo' },
                { id: '126', name: 'Foguete', price: 1000, icon: '🚀', category: 'VIP' },
                { id: '133', name: 'Dragão', price: 5000, icon: '🐉', category: 'VIP' }
            ];
            await GiftModel.insertMany(defaultGifts);
            console.log("🎁 Presentes iniciais criados!");
        }
    } catch (e) {
        console.error("Erro ao semear presentes:", e);
    }
};

const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    diamonds: { type: Number, default: 5000 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
});

const GiftSchema = new mongoose.Schema({
    id: String,
    name: { type: String, unique: true },
    price: Number,
    icon: String,
    category: String
});

const StreamerSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    hostId: String,
    active: { type: Boolean, default: true }
});

const TransactionSchema = new mongoose.Schema({
    userId: String,
    receiverId: String,
    streamId: String,
    amount: Number,
    giftName: String,
    timestamp: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model('User', UserSchema);
export const GiftModel = mongoose.model('Gift', GiftSchema);
export const StreamerModel = mongoose.model('Streamer', StreamerSchema);
export const TransactionModel = mongoose.model('Transaction', TransactionSchema);