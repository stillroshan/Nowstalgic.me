import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timeline'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  type: {
    type: String,
    enum: ['view', 'like', 'comment', 'share'],
    required: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

analyticsSchema.index({ user: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ timeline: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ event: 1, type: 1, createdAt: -1 });

export default mongoose.model('Analytics', analyticsSchema); 