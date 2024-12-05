import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

export default router; 