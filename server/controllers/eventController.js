import Event from '../models/Event.js';
import Timeline from '../models/Timeline.js';
import { catchAsync } from '../utils/catchAsync.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import APIFeatures from '../utils/apiFeatures.js';
import { createNotification } from '../services/notificationService.js';
import { trackEvent } from '../services/analyticsService.js';
import { emitEventUpdate } from '../services/socketService.js';

// Create a new event
export const createEvent = catchAsync(async (req, res) => {
    // Verify timline ownership
    const timeline = await Timeline.findOne({
        _id: req.body.timeline,
        user: req.user._id
    });

    if (!timeline) {
        return res.status(403).json({
            status: 'error',
            message: 'Timeline not found or unauthorized'
        });
    }

    // Handle media uploads if files exist
    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadedMedia = await uploadToCloudinary(file);
            mediaFiles.push(uploadedMedia);
        }
    }

    const event = await Event.create({
        ...req.body,
        timeline: timeline._id,
        media: mediaFiles
    });

    // Add event to timeline
    timeline.events.push(event._id);
    await timeline.save();

    res.status(201).json({
        status: 'success',
        data: event
    });
});

// Get a single event
export const getEvent = catchAsync(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('timeline')
        .populate('tags.user', 'username profilePicture')
        .populate('likes', 'username profilePicture')
        .populate('comments.user', 'username profilePicture');

    if (!event) {
        return res.status(404).json({
            satus: 'error',
            message: 'Event not found'
        });
    }

    // Track view
    await trackEvent({
        user: req.user._id,
        event: event._id,
        timeline: event.timeline._id,
        type: 'view'
    });

    res.json({
        status: 'success',
        data: event
    });
});

// Update an event
export const updateEvent = catchAsync(async (req, res) => {
    const event = await Event.findOne({
        _id: req.params.id,
        timeline: { $in: await Timeline.find({ user: req.user._id }).select('_id') }
    });

    if (!event) {
        return res.status(404).json({
            status: 'error',
            message: 'Event not found or unauthorized'
        });
    }

    // Handle media updates if files exist
    if (req.files && req.files.length > 0) {
        // Delete existing media from Cloudinary
        for (const media of event.media) {
            const publicId = media.url.split('/').pop().split('.')[0];
            await deleteFromCloudinary(publicId, media.type);
        }

        // Upload new media
        const mediaFiles = [];
        for (const file of req.files) {
            try {
                const uploadedMedia = await uploadToCloudinary(file);
                mediaFiles.push(uploadedMedia);
            } catch (error) {
                return res.status(400).json({
                    status: 'error',
                    message: `Failed to upload media: ${error.message}`
                });
            }
        }
        req.body.media = mediaFiles;
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
        event._id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        status: 'success',
        data: updatedEvent
    });
});

// Delete an event
export const deleteEvent = catchAsync(async (req, res) => {
    const event = await Event.findOne({
        _id: req.params.id,
        timeline: { $in: await Timeline.find({ user: req.user._id }).select('_id') }
    });

    if (!event) {
        return res.status(404).json({
            status: 'error',
            message: 'Event not found or unauthorized'
        });
    }

    // Delete associated media files
    if (event.media && event.media.length > 0) {
        for (const media of event.media) {
            try {
                const publicId = media.url.split('/').pop().split('.')[0];
                await deleteFromCloudinary(publicId, media.type);
            } catch (error) {
                console.error(`Failed to delete media: ${error.message}`);
            }
        }
    }

    // Remove event from timeline
    await Timeline.updateOne(
        { _id: event.timeline },
        { $pull: { events: event._id } }
    );

    // Delete the event
    await Event.findByIdAndDelete(event._id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Like an event
export const toggleLike = catchAsync(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('timeline');

    if (!event) {
        return res.status(404).json({
            status: 'error',
            message: 'Event not found'
        });
    }

    const isLiked = event.likes.includes(req.user._id);

    if (isLiked) {
        event.likes.pull(req.user._id);
    } else {
        event.likes.push(req.user._id);

        // Create notification for event owner
        if (event.timeline.user.toString() !== req.user._id.toString()) {
            await createNotification({
                recipient: event.timeline.user,
                sender: req.user._id,
                type: 'like',
                event: event._id,
                timeline: event.timeline._id,
                message: `${req.user.username} liked your event "${event.title}"`
            });
        }
    }

    await event.save();

    // Track analytics
    await trackEvent({
        user: req.user._id,
        event: event._id,
        timeline: event.timeline._id,
        type: 'like'
    });

    // Emit real-time update
    emitEventUpdate(event._id, {
        type: 'like',
        user: req.user._id,
        action: isLiked ? 'unlike' : 'like'
    });

    res.json({
        status: 'success',
        data: event
    });
});

// Add a Comment
export const addComment = catchAsync(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('timeline');

    if (!event) {
        return res.status(404).json({
            status: 'error',
            message: 'Event not found'
        });
    }

    const comment = {
        user: req.user._id,
        text: req.body.text
    };

    event.comments.push(comment);
    await event.save();

    // Create notification for event owner
    if (event.timeline.user.toString() !== req.user._id.toString()) {
        await createNotification({
            recipient: event.timeline.user,
            sender: req.user._id,
            type: 'comment',
            event: event._id,
            timeline: event.timeline._id,
            message: `${req.user.username} commented on your event "${event.title}"`
        });
    }

    // Track analytics
    await trackEvent({
        user: req.user._id,
        event: event._id,
        timeline: event.timeline._id,
        type: 'comment',
        metadata: { commentId: comment._id }
    });

    // Emit real-time update
    emitEventUpdate(event._id, {
        type: 'comment',
        user: req.user._id,
        comment: comment
    });

    res.status(201).json({
        status: 'success',
        data: event
    });
});

// Add a new function to handle individual media deletion
export const deleteEventMedia = catchAsync(async (req, res) => {
    const { eventId, mediaId } = req.params;

    const event = await Event.findOne({
        _id: eventId,
        timeline: { $in: await Timeline.find({ user: req.user._id }).select('_id') }
    });

    if (!event) {
        return res.status(404).json({
            status: 'error',
            message: 'Event not found or unauthorized'
        });
    }

    const mediaToDelete = event.media.id(mediaId);
    if (!mediaToDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Media not found'
        });
    }

    try {
        const publicId = mediaToDelete.url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId, mediaToDelete.type);

        // Remove media from event
        event.media.pull(mediaId);
        await event.save();

        res.json({
            status: 'success',
            data: event
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: `Failed to delete media: ${error.message}`
        });
    }
});

// Get all events with filtering, sorting, and pagination
export const getEvents = catchAsync(async (req, res) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .search()
    .paginate();

  const [events, total] = await Promise.all([
    features.query
      .populate('timeline')
      .populate('tags.user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('comments.user', 'username profilePicture'),
    Event.countDocuments(features.query._conditions)
  ]);

  res.json({
    status: 'success',
    results: events.length,
    total,
    page: parseInt(req.query.page, 10) || 1,
    data: events
  });
});

// Get events by category
export const getEventsByCategory = catchAsync(async (req, res) => {
  const features = new APIFeatures(
    Event.find({ 
      category: req.params.category,
      visibility: 'public'
    }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [events, total] = await Promise.all([
    features.query
      .populate('timeline')
      .populate('tags.user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('comments.user', 'username profilePicture'),
    Event.countDocuments({ category: req.params.category })
  ]);

  res.json({
    status: 'success',
    results: events.length,
    total,
    data: events
  });
});

// Get events by date range
export const getEventsByDateRange = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const features = new APIFeatures(
    Event.find({ 
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      visibility: 'public'
    }),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [events, total] = await Promise.all([
    features.query
      .populate('timeline')
      .populate('tags.user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('comments.user', 'username profilePicture'),
    Event.countDocuments(features.query._conditions)
  ]);

  res.json({
    status: 'success',
    results: events.length,
    total,
    data: events
  });
});

// Delete comment
export const deleteComment = catchAsync(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).json({
      status: 'error',
      message: 'Event not found'
    });
  }

  const comment = event.comments.id(req.params.commentId);
  
  if (!comment) {
    return res.status(404).json({
      status: 'error',
      message: 'Comment not found'
    });
  }

  // Check if user is comment owner
  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'Not authorized to delete this comment'
    });
  }

  event.comments.pull(req.params.commentId);
  await event.save();

  res.json({
    status: 'success',
    data: event
  });
});