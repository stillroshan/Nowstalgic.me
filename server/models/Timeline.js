import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'followers'],
        default: 'public'
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }]
}, { timestamps: true });

// Add index for better query performance
timelineSchema.index({ user: 1, visibility: 1 });
timelineSchema.index({ tags: 1 });

export default mongoose.model('Timeline', timelineSchema);