import Timeline from '../models/Timeline.js';
import Event from '../models/Event.js';
import { catchAsync } from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

// Create a new timeline
export const createTimeline = catchAsync(async (req, res) => {
    const timeline = await Timeline.create({
        ...req.body,
        user: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data: timeline
    });
});

// Get a single timeline
export const getTimeline = catchAsync(async (req, res) => {
    const timeline = await Timeline.findById(req.params.id)
        .populate('user', 'username profilePicture')
        .populate('events');

    if(!timeline) {
        return res.status(404).json({
            status: 'error',
            message: 'Timeline not found'
        });
    }

    // Check visibility permissions
    if (timeline.visibility === 'private' && timeline.user.toString() !== req.user._id.toSTring()) {
        return res.status(403).json({
            status: 'error',
            message: 'You do not have permission to view this timeline'
        });
    }

    res.json({
        status: 'success',
        data: timeline
    });
});

// Update a timeline
export const updateTimeline = catchAsync(async (req, res) => {
    const timeline = await Timeline.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!timeline) {
        return res.status(404).json({
            status: 'error',
            message: 'Timeline not found or unauthorized'
        });
    }

    res.json({
        status: 'success',
        data: timeline
    });
});

// Delete a timeline
export const deleteTimeline = catchAsync(async (req, res) => {
    const timeline = await Timeline.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!timeline) {
        return res.status(404).json({
            status: 'error',
            message: 'Timeline not found or unauthorized'
        });
    }

    // Delete all associated events
    await Event.deleteMany({ timeline: req.params.id });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Follow a timeline
export const followTimeline = catchAsync(async (req, res) => {
    const timeline = await Timeline.findById(req.params.id);

    if (!timeline) {
        return res.status(404).json({
            status: 'error',
            message: 'Timeline not found'
        });
    }

    if (timeline.followers.includes(req.user._id)) {
        timeline.followers.pull(req.user._id);
    } else {
        timeline.followers.push(req.user._id);
    }

    await timeline.save();

    res.json({
        status: 'success',
        data: timeline
    });
});

// Get all timelines with filtering, sorting, and pagination
export const getTimelines = catchAsync(async (req, res) => {
  const features = new APIFeatures(Timeline.find(), req.query)
    .filter()
    .sort()
    .search()
    .paginate();

  const [timelines, total] = await Promise.all([
    features.query.populate('user', 'username profilePicture'),
    Timeline.countDocuments(features.query._conditions)
  ]);

  res.json({
    status: 'success',
    results: timelines.length,
    total,
    page: parseInt(req.query.page, 10) || 1,
    data: timelines
  });
});

// Get user's own timelines
export const getUserTimelines = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Timeline.find({ user: req.params.userId || req.user._id }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [timelines, total] = await Promise.all([
    features.query
      .populate('user', 'username profilePicture')
      .populate({
        path: 'events',
        options: { sort: { date: -1 } }
      }),
    Timeline.countDocuments({ user: req.params.userId || req.user._id })
  ]);

  res.json({
    status: 'success',
    results: timelines.length,
    total,
    data: timelines
  });
});

// Get followed timelines
export const getFollowedTimelines = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Timeline.find({ 
      followers: req.user._id,
      visibility: { $ne: 'private' }
    }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [timelines, total] = await Promise.all([
    features.query
      .populate('user', 'username profilePicture')
      .populate({
        path: 'events',
        options: { sort: { date: -1 } }
      }),
    Timeline.countDocuments({ followers: req.user._id })
  ]);

  res.json({
    status: 'success',
    results: timelines.length,
    total,
    data: timelines
  });
});