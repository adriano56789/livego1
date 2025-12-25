 import mongoose from 'mongoose';
export const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://72.60.249.175:27017/livego?authSource=admin';
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB Conectado");
        await seedGifts();
    }
    catch (err) {
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
    }
    catch (e) {
        console.error("Erro ao semear presentes:", e);
    }
};
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    identification: { type: String },
    name: { type: String, required: true },
    username: { type: String },
    avatarUrl: { type: String },
    coverUrl: { type: String },
    email: { type: String },
    diamonds: { type: Number, default: 5000 },
    isVIP: { type: Boolean, default: false },
    vipSince: { type: Date },
    vipExpirationDate: { type: Date },
    badges: [{ type: String }],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    fanClub: {
        streamerId: String,
        streamerName: String,
        level: Number
    },
    activeFrameId: { type: String },
    frameExpiration: { type: Date },
    ownedFrames: [{
            frameId: String,
            expirationDate: Date
        }],
    isLive: { type: Boolean, default: false },
    liveTitle: { type: String },
    liveCategory: { type: String },
    liveTags: [{ type: String }],
    thumbnailUrl: { type: String },
    viewerCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    lastConnected: { type: Date },
    connectedClients: [{ type: String }],
    earnings: { type: Number, default: 0 },
    earnings_withdrawn: { type: Number, default: 0 },
    adminEarnings: { type: Number, default: 0 },
    platformEarnings: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    fans: { type: Number, default: 0 },
    followers: [{ type: String }],
    followingIds: [{ type: String }],
    blockedIds: [{ type: String }],
    isFollowed: { type: Boolean, default: false },
    relationship: { type: String, enum: ['none', 'following', 'friend'], default: 'none' },
    visitors: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'not_specified'], default: 'not_specified' },
    age: { type: Number },
    location: { type: String },
    distance: { type: String },
    bio: { type: String },
    obras: [{ type: mongoose.Schema.Types.Mixed }],
    curtidas: [{ type: mongoose.Schema.Types.Mixed }],
    topFansAvatars: [{ type: String }],
    receptores: { type: Number, default: 0 },
    enviados: { type: Number, default: 0 },
    country: { type: String },
    locationPermission: { type: String, enum: ['prompt', 'granted', 'denied'], default: 'prompt' },
    showActivityStatus: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    pipEnabled: { type: Boolean, default: true },
    chatPermission: { type: String, enum: ['all', 'followers', 'none'], default: 'all' },
    isAvatarProtected: { type: Boolean, default: false },
    privateStreamSettings: {
        allowedUsers: [{ type: String }],
        price: { type: Number, default: 0 },
        isPrivate: { type: Boolean, default: false }
    },
    withdrawal_method: {
        method: String,
        details: mongoose.Schema.Types.Mixed
    },
    notificationSettings: {
        newMessages: { type: Boolean, default: true },
        streamerLive: { type: Boolean, default: true },
        newFollower: { type: Boolean, default: true },
        newMessage: { type: Boolean, default: true },
        followedPosts: { type: Boolean, default: true },
        pedido: { type: Boolean, default: true },
        interactive: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        followerPost: { type: Boolean, default: true },
        order: { type: Boolean, default: true }
    },
    beautySettings: {
        smooth: { type: Number, default: 0 },
        whiten: { type: Number, default: 0 },
        rosy: { type: Number, default: 0 },
        thinFace: { type: Number, default: 0 },
        bigEye: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
// Add indexes for better query performance
UserSchema.index({ id: 1 });
UserSchema.index({ isOnline: 1 });
UserSchema.index({ isLive: 1 });
UserSchema.index({ 'fanClub.streamerId': 1 });
UserSchema.index({ 'followingIds': 1 });
UserSchema.index({ 'followers': 1 });
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
const ReportSchema = new mongoose.Schema({
    reporterId: { type: String, required: true },
    targetId: { type: String, required: true },
    reason: { type: String, required: true },
    description: String,
    status: { type: String, default: 'pending', enum: ['pending', 'reviewed', 'resolved', 'rejected'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const UserModel = mongoose.model('User', UserSchema);
export const GiftModel = mongoose.model('Gift', GiftSchema);
export const StreamerModel = mongoose.model('Streamer', StreamerSchema);
export const TransactionModel = mongoose.model('Transaction', TransactionSchema);
export const ReportModel = mongoose.model('Report', ReportSchema);
// Add Message model
const MessageSchema = new mongoose.Schema({
    chatId: { type: String },
    text: { type: String, required: true },
    from: { type: String, required: true },
    fromUserId: { type: String },
    to: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    imageUrl: { type: String },
    tempId: { type: String },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    isAck: { type: Boolean, default: false },
    avatarUrl: { type: String },
    username: { type: String },
    badgeLevel: { type: Number }
});
export const MessageModel = mongoose.model('Message', MessageSchema);
