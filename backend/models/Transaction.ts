import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['recharge', 'gift', 'withdrawal', 'bonus'] },
    amountDiamonds: Number,
    amountBRL: Number,
    status: { type: String, default: 'pending' },
    details: mongoose.Schema.Types.Mixed
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const TransactionModel = mongoose.model('Transaction', TransactionSchema);