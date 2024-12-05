import Notification from '../models/Notification.js';
import { emitNotification } from './socketService.js';

export const createNotification = async ({
  recipient,
  sender,
  type,
  event,
  timeline,
  message
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      event,
      timeline,
      message
    });

    await notification.populate('sender', 'username profilePicture');
    
    // Emit real-time notification
    emitNotification(recipient, notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}; 