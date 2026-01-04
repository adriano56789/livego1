
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: String, required: true }], // IDs dos usuários
    lastMessage: { type: String, default: "" },
    unreadCount: { type: Map, of: Number, default: {} },
    updatedAt: { type: Date, default: Date.now }
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

export const ConversationModel = mongoose.model('Conversation', ConversationSchema);
