import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    timeline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timeline',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    media: [{
        type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    location: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['achievement', 'birthday', 'career', 'personal', 'relationship', 'travel', 'other'],
        required: true
    },
    happiness: {
        type: Number,
        min: -100,
        max: 100,
        default: 0
    },
    tags: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    visibility: {
        type: String,
        enum: ['public', 'private', 'followers'],
        default: 'public'
    }
}, { timestamps: true });

// Keep only essential indexes
eventSchema.index({ timeline: 1, date: -1 });
eventSchema.index({ 'tags.user': 1, category: 1 });
eventSchema.index({ visibility: 1, createdAt: -1 });
eventSchema.index({ createdAt: -1 });

export default mongoose.model('Event', eventSchema);