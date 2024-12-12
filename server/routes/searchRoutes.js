import express from 'express';
import * as searchController from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all search routes

router.get('/suggestions', searchController.getSuggestions);
router.get('/', searchController.search);

export default router; 