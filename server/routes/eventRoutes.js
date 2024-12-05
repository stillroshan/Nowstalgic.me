import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMedia.js';
import { createEventRules } from '../middleware/validate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
  .get(eventController.getEvents)
  .post(
    protect,
    upload.array('media', 5),
    createEventRules,
    validate,
    eventController.createEvent
  );

router.route('/:id')
  .get(eventController.getEvent)
  .patch(upload.array('media', 5), eventController.updateEvent)
  .delete(eventController.deleteEvent);

router.post('/:id/like', eventController.toggleLike);
router.post('/:id/comment', eventController.addComment);

router.delete('/:eventId/media/:mediaId', eventController.deleteEventMedia);

router.get('/category/:category', eventController.getEventsByCategory);
router.get('/date-range', eventController.getEventsByDateRange);
router.delete('/:eventId/comments/:commentId', eventController.deleteComment);

export default router;
