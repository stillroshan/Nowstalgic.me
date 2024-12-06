import express from 'express';
import { protect } from '../middleware/auth.js';
import * as messageController from '../controllers/messageController.js';
import { upload } from '../middleware/uploadMedia.js';

const router = express.Router();

router.use(protect); // Protect all message routes

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessages);
router.post(
  '/', 
  upload.single('media'),
  messageController.sendMessage
);
router.delete('/:id', messageController.deleteMessage);

export default router; 