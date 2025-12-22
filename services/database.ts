
import mongoose from 'mongoose';
import { dbConfig } from './config';

// --- Conexão ---

export const connectDB = async () => {
  try {
    if (!dbConfig.mongodb.url) {
        throw new Error("MONGODB_URI não está definida.");
    }
    
    await mongoose.connect(dbConfig.mongodb.url);
    console.log('🔥 MongoDB Conectado com Sucesso');
  } catch (error) {
    console.error('❌ Erro fatal ao conectar no MongoDB:', error);
    // Cast process to any to safely access exit in a browser-like or shimmed environment
    if (typeof process !== 'undefined' && (process as any).exit) {
        (process as any).exit(1);
    }
  }
};

// --- Schemas & Models ---

const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    identification: { type: String },
    name: { type: String, required: true },
    username: { type: String },
    avatarUrl: { type: String },
    coverUrl: { type: String },
    email: { type: String },
    diamonds: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    earnings_withdrawn: { type: Number, default: 0 },
    platformEarnings: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    isVIP: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
    following: { type: Number, default: 0 },
    fans: { type: Number, default: 0 },
    location: { type: String },
    bio: { type: String },
    gender: { type: String, enum: ['male', 'female', 'not_specified'], default: 'not_specified' },
    age: { type: Number },
    activeFrameId: { type: String },
    frameExpiration: { type: String },
    withdrawal_method: { type: Object },
    billingAddress: { type: Object },
    creditCardInfo: { type: Object },
    ownedFrames: [{
        frameId: String,
        expirationDate: String
    }],
    createdAt: { type: Date, default: Date.now },
    lastSeen: { type: Date }
});

export const UserModel = mongoose.model('User', UserSchema);

const StreamerSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    hostId: { type: String, required: true, ref: 'User' },
    name: { type: String },
    avatar: { type: String },
    thumbnail: { type: String },
    description: { type: String },
    category: { type: String },
    isPrivate: { type: Boolean, default: false },
    viewers: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    quality: { type: String, default: '720p' },
    tags: [String],
    active: { type: Boolean, default: true }
});

export const StreamerModel = mongoose.model('Streamer', StreamerSchema);

const GiftSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    icon: { type: String },
    category: { type: String },
    triggersAutoFollow: { type: Boolean, default: false }
});

export const GiftModel = mongoose.model('Gift', GiftSchema);

const TransactionSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userId: { type: String, required: true, ref: 'User' },
    type: { type: String, required: true },
    amountBRL: { type: Number },
    amountCoins: { type: Number },
    status: { type: String, enum: ['Concluído', 'Pendente', 'Cancelado'], default: 'Pendente' },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    relatedUserId: { type: String },
    isAdminTransaction: { type: Boolean, default: false }
});

export const TransactionModel = mongoose.model('Transaction', TransactionSchema);

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
