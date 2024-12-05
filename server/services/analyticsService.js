import Analytics from '../models/Analytics.js';
import mongoose from 'mongoose';

export const trackEvent = async ({
  user,
  timeline,
  event,
  type,
  metadata = {}
}) => {
  try {
    await Analytics.create({
      user,
      timeline,
      event,
      type,
      metadata
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't throw error to prevent disrupting main flow
  }
};

export const getTimelineAnalytics = async (timelineId, startDate, endDate) => {
  const analytics = await Analytics.aggregate([
    {
      $match: {
        timeline: mongoose.Types.ObjectId(timelineId),
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  return analytics;
}; 