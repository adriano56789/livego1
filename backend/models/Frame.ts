
import mongoose from 'mongoose';

const FrameSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: 'avatar' },
    active: { type: Boolean, default: true }
}, { 
    toJSON: {
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export const FrameModel = mongoose.model('Frame', FrameSchema);
