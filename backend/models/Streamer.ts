
import mongoose from 'mongoose';

const StreamerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    streamer_id: { type: String, required: true, index: true }, // Adicionado para satisfazer a validação do banco na VPS
    hostId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatar: String,
    thumbnail: String,
    category: { type: String, default: 'popular' },
    viewers: { type: Number, default: 0 },
    location: String,
    isPrivate: { type: Boolean, default: false },
    quality: { type: String, default: '720p' },
    tags: [String]
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

export const StreamerModel = mongoose.model('Streamer', StreamerSchema);
