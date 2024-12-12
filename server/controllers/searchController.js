import User from '../models/User.js'
import Timeline from '../models/Timeline.js'
import Event from '../models/Event.js'
import { catchAsync } from '../utils/catchAsync.js'
import APIFeatures from '../utils/apiFeatures.js'

// Get quick suggestions
export const getSuggestions = catchAsync(async (req, res) => {
  const query = req.query.q
  if (!query) {
    return res.json({ status: 'success', data: [] })
  }

  const [users, timelines] = await Promise.all([
    User.aggregate([
      {
        $search: {
          index: "user_search",
          compound: {
            should: [
              {
                text: {
                  query: query,
                  path: ["username", "displayName"],
                  fuzzy: { maxEdits: 1 }
                }
              }
            ]
          }
        }
      },
      { $limit: 5 },
      {
        $project: {
          username: 1,
          displayName: 1,
          profilePicture: 1,
          bio: 1,
          score: { $meta: "searchScore" }
        }
      }
    ]),

    Timeline.aggregate([
      {
        $search: {
          index: "timeline_search",
          text: {
            query: query,
            path: ["title", "description"],
            fuzzy: { maxEdits: 1 }
          }
        }
      },
      { $match: { visibility: 'public' } },
      { $limit: 3 },
      {
        $project: {
          title: 1,
          description: 1,
          score: { $meta: "searchScore" }
        }
      }
    ])
  ])

  const suggestions = [
    ...users.map(user => ({ ...user, type: 'user' })),
    ...timelines.map(timeline => ({ ...timeline, type: 'timeline' }))
  ]

  res.json({ status: 'success', data: suggestions })
})

// Full search with filters
export const search = catchAsync(async (req, res) => {
  const { type } = req.query
  const results = { users: [], timelines: [], events: [] }

  if (type === 'all' || type === 'users') {
    results.users = await User.aggregate([
      {
        $search: {
          index: "user_search",
          text: {
            query: req.query.q,
            path: ["username", "displayName", "bio"],
            fuzzy: { maxEdits: 1 }
          }
        }
      },
      { $limit: 20 },
      {
        $project: {
          username: 1,
          displayName: 1,
          profilePicture: 1,
          bio: 1,
          score: { $meta: "searchScore" }
        }
      }
    ])
  }

  if (type === 'all' || type === 'timelines') {
    results.timelines = await Timeline.aggregate([
      {
        $search: {
          index: "timeline_search",
          text: {
            query: req.query.q,
            path: ["title", "description", "tags"],
            fuzzy: { maxEdits: 1 }
          }
        }
      },
      { $limit: 20 },
      {
        $project: {
          title: 1,
          description: 1,
          visibility: 1,
          user: 1,
          tags: 1,
          score: { $meta: "searchScore" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ])
  }

  if (type === 'all' || type === 'events') {
    results.events = await Event.aggregate([
      {
        $search: {
          index: "event_search",
          text: {
            query: req.query.q,
            path: ["title", "description", "location"],
            fuzzy: { maxEdits: 1 }
          }
        }
      },
      { $limit: 20 },
      {
        $project: {
          title: 1,
          description: 1,
          date: 1,
          location: 1,
          timeline: 1,
          score: { $meta: "searchScore" }
        }
      },
      {
        $lookup: {
          from: 'timelines',
          localField: 'timeline',
          foreignField: '_id',
          as: 'timeline'
        }
      },
      {
        $unwind: '$timeline'
      }
    ]);
  }

  res.json({ status: 'success', data: results })
})