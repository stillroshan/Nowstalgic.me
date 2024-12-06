import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createNotification } from '../services/notificationService.js';

// Follow a user
export const followUser = catchAsync(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      status: 'error',
      message: 'You cannot follow yourself'
    });
  }

  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToFollow) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  if (currentUser.following.includes(userToFollow._id)) {
    return res.status(400).json({
      status: 'error',
      message: 'You are already following this user'
    });
  }

  // Add to following/followers
  currentUser.following.push(userToFollow._id);
  userToFollow.followers.push(currentUser._id);

  await Promise.all([currentUser.save(), userToFollow.save()]);

  // Create notification
  await createNotification({
    recipient: userToFollow._id,
    sender: currentUser._id,
    type: 'follow',
    message: `${currentUser.username} started following you`
  });

  res.json({
    status: 'success',
    data: {
      following: currentUser.following,
      followers: userToFollow.followers
    }
  });
});

// Unfollow a user
export const unfollowUser = catchAsync(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      status: 'error',
      message: 'You cannot unfollow yourself'
    });
  }

  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!userToUnfollow) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  if (!currentUser.following.includes(userToUnfollow._id)) {
    return res.status(400).json({
      status: 'error',
      message: 'You are not following this user'
    });
  }

  // Remove from following/followers
  currentUser.following = currentUser.following.filter(
    id => id.toString() !== userToUnfollow._id.toString()
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== currentUser._id.toString()
  );

  await Promise.all([currentUser.save(), userToUnfollow.save()]);

  res.json({
    status: 'success',
    data: {
      following: currentUser.following,
      followers: userToUnfollow.followers
    }
  });
});

// Get user followers
export const getFollowers = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('followers', 'username profilePicture bio');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.json({
    status: 'success',
    data: user.followers
  });
});

// Get user following
export const getFollowing = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('following', 'username profilePicture bio');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  res.json({
    status: 'success',
    data: user.following
  });
}); 