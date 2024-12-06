import Message from '../models/Message.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createNotification } from '../services/notificationService.js';
import { emitNewMessage, emitMessageRead } from '../services/socketService.js';

// Get conversations list
export const getConversations = catchAsync(async (req, res) => {
  const conversations = await Message.aggregate([
    // Match messages where user is either sender or recipient
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id }
        ],
        deletedFor: { $ne: req.user._id }
      }
    },
    // Sort by latest message
    { $sort: { createdAt: -1 } },
    // Group by conversation
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', req.user._id] },
            '$recipient',
            '$sender'
          ]
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', req.user._id] },
                  { $eq: ['$read', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    // Lookup user details
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    // Unwind the user array
    { $unwind: '$user' },
    // Project final shape
    {
      $project: {
        user: {
          _id: 1,
          username: 1,
          profilePicture: 1
        },
        lastMessage: {
          content: 1,
          createdAt: 1,
          read: 1
        },
        unreadCount: 1
      }
    }
  ]);

  res.json({
    status: 'success',
    data: conversations
  });
});

// Get messages between two users
export const getMessages = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id }
    ],
    deletedFor: { $ne: req.user._id }
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username profilePicture')
    .populate('recipient', 'username profilePicture');

  // Mark messages as read
  await Message.updateMany(
    {
      sender: userId,
      recipient: req.user._id,
      read: false
    },
    { read: true }
  );

  // Emit message read event
  emitMessageRead(userId, req.user._id);

  res.json({
    status: 'success',
    data: messages.reverse()
  });
});

// Send a message
export const sendMessage = catchAsync(async (req, res) => {
  const { recipient, content } = req.body;

  // Check if recipient exists
  const recipientUser = await User.findById(recipient);
  if (!recipientUser) {
    return res.status(404).json({
      status: 'error',
      message: 'Recipient not found'
    });
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient,
    content
  });

  await message.populate('sender', 'username profilePicture');
  await message.populate('recipient', 'username profilePicture');

  // Create notification
  await createNotification({
    recipient,
    sender: req.user._id,
    type: 'message',
    message: `${req.user.username} sent you a message`
  });

  // Emit new message event
  emitNewMessage(recipient, message);

  res.status(201).json({
    status: 'success',
    data: message
  });
});

// Delete message
export const deleteMessage = catchAsync(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      status: 'error',
      message: 'Message not found'
    });
  }

  // Check if user is sender or recipient
  if (![message.sender.toString(), message.recipient.toString()].includes(req.user.id)) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete this message'
    });
  }

  message.deletedFor.push(req.user._id);
  await message.save();

  res.json({
    status: 'success',
    data: null
  });
}); 