import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { catchAsync } from '../utils/catchAsync.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    user.username = req.body.username || user.username;
    user.displayName = req.body.displayName || user.displayName;
    user.bio = req.body.bio || user.bio;

    // Handle email update
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
      user.isVerified = false;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture from cloudinary if exists
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Upload new image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pictures',
      width: 500,
      crop: 'fill',
    });

    user.profilePicture = result.secure_url;
    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/users/profile/picture
// @access  Private
export const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.profilePicture = '';
    await user.save();

    res.json({ message: 'Profile picture removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = catchAsync(async (req, res) => {
  const { type } = req.params
  const updates = req.body

  // Validate settings type
  const allowedTypes = ['notifications', 'privacy']
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid settings type'
    })
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [`settings.${type}`]: updates },
    { new: true, runValidators: true }
  )

  res.json({
    status: 'success',
    user
  })
})

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id).select('+password')

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Current password is incorrect'
    })
  }

  user.password = newPassword
  await user.save()

  res.json({
    status: 'success',
    message: 'Password updated successfully'
  })
})

export const deleteAccount = catchAsync(async (req, res) => {
  const { password } = req.body
  const user = await User.findById(req.user._id).select('+password')

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Password is incorrect'
    })
  }

  await User.findByIdAndDelete(req.user._id)

  res.json({
    status: 'success',
    message: 'Account deleted successfully'
  })
}) 