import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  media: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', ''],
    default: ''
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema); 