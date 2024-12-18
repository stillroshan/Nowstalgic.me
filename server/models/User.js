import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 8,
    // Not required because of Google OAuth
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not conflict with uniqueness
  },
  displayName: {
    type: String,
    default: '',
    trim: true,
    maxLength: 30
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxLength: 160
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastActive: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  settings: {
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      newFollower: { type: Boolean, default: true },
      newComment: { type: Boolean, default: true },
      newLike: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      timelineUpdates: { type: Boolean, default: true }
    },
    privacy: {
      defaultVisibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
      allowTagging: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      allowMessaging: { type: String, enum: ['everyone', 'followers', 'none'], default: 'everyone' },
      showTimelines: { type: Boolean, default: true }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for counts
userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

userSchema.virtual('timelinesCount', {
  ref: 'Timeline',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ followers: 1, following: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);