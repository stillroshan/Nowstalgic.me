import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['follow', 'like', 'comment', 'tag', 'mention'],
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    timeline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timeline'
    },
    read: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Index for better query performance
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);