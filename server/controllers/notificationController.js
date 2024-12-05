import Notification from '../models/Notification.js';
import { catchAsync } from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

export const getNotifications = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Notification.find({ recipient: req.user._id }),
    req.query
  )
    .sort()
    .paginate();

  const [notifications, total] = await Promise.all([
    features.query
      .populate('sender', 'username profilePicture')
      .populate('event', 'title')
      .populate('timeline', 'title'),
    Notification.countDocuments({ recipient: req.user._id })
  ]);

  res.json({
    status: 'success',
    results: notifications.length,
    total,
    data: notifications
  });
});

export const markNotificationAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipient: req.user._id
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      status: 'error',
      message: 'Notification not found'
    });
  }

  res.json({
    status: 'success',
    data: notification
  });
});

export const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({
    status: 'success',
    message: 'All notifications marked as read'
  });
}); 