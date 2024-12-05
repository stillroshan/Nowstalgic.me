import express from 'express';
import * as timelineController from '../controllers/timelineController.js';
import { protect } from '../middleware/auth.js';
import { createTimelineRules } from '../middleware/validate.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
  .get(timelineController.getTimelines)
  .post(
    protect,
    createTimelineRules,
    validate,
    timelineController.createTimeline
  );

router.route('/:id')
  .get(timelineController.getTimeline)
  .patch(timelineController.updateTimeline)
  .delete(timelineController.deleteTimeline);

router.post('/:id/follow', timelineController.followTimeline);

router.get('/user/:userId?', timelineController.getUserTimelines);
router.get('/followed', timelineController.getFollowedTimelines);

export default router;
