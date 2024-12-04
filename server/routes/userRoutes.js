import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import {
  getUserProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
} from '../controllers/userController.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
});

// Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put(
  '/profile/picture',
  protect,
  upload.single('profilePicture'),
  updateProfilePicture
);
router.delete('/profile/picture', protect, deleteProfilePicture);

export default router; 