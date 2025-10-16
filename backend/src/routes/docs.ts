import { Router, Request, Response } from 'express';

const router = Router();

// API Documentation endpoint
router.get('/', (req: Request, res: Response) => {
  const apiDocs = {
    title: 'Cybernauts API Documentation',
    version: '1.0.0',
    description: 'Interactive User Relationship & Hobby Network API',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      users: {
        'GET /users': {
          description: 'Get all users',
          parameters: 'None',
          response: {
            success: true,
            data: [
              {
                id: 'uuid',
                username: 'string',
                age: 'number',
                hobbies: ['string'],
                friends: ['uuid'],
                createdAt: 'Date',
                popularityScore: 'number'
              }
            ]
          }
        },
        'GET /users/:id': {
          description: 'Get user by ID',
          parameters: {
            id: 'User UUID'
          },
          response: {
            success: true,
            data: {
              id: 'uuid',
              username: 'string',
              age: 'number',
              hobbies: ['string'],
              friends: ['uuid'],
              createdAt: 'Date',
              popularityScore: 'number'
            }
          }
        },
        'POST /users': {
          description: 'Create new user',
          body: {
            username: 'string (required, 2-50 chars)',
            age: 'number (required, 13-120)',
            hobbies: ['string (required, min 1 hobby)']
          },
          response: {
            success: true,
            data: 'User object'
          }
        },
        'PUT /users/:id': {
          description: 'Update user',
          parameters: {
            id: 'User UUID'
          },
          body: {
            username: 'string (optional)',
            age: 'number (optional)',
            hobbies: ['string (optional)']
          },
          response: {
            success: true,
            data: 'Updated user object'
          }
        },
        'DELETE /users/:id': {
          description: 'Delete user',
          parameters: {
            id: 'User UUID'
          },
          response: {
            success: true,
            message: 'User deleted successfully'
          }
        },
        'GET /users/search': {
          description: 'Search users by username or hobbies',
          query: {
            q: 'Search query string'
          },
          response: {
            success: true,
            data: ['User objects']
          }
        },
        'GET /users/stats': {
          description: 'Get user statistics',
          response: {
            success: true,
            data: {
              totalUsers: 'number',
              totalFriendships: 'number',
              averagePopularityScore: 'number',
              topUsers: ['User objects']
            }
          }
        }
      },
      relationships: {
        'POST /users/:id/link': {
          description: 'Create friendship between users',
          parameters: {
            id: 'User UUID'
          },
          body: {
            friendId: 'Friend UUID'
          },
          response: {
            success: true,
            message: 'Friendship created successfully'
          }
        },
        'DELETE /users/:id/unlink': {
          description: 'Remove friendship between users',
          parameters: {
            id: 'User UUID'
          },
          body: {
            friendId: 'Friend UUID'
          },
          response: {
            success: true,
            message: 'Friendship removed successfully'
          }
        }
      },
      graph: {
        'GET /graph': {
          description: 'Get graph data for visualization',
          response: {
            success: true,
            data: {
              nodes: [
                {
                  id: 'string',
                  data: {
                    label: 'string',
                    username: 'string',
                    age: 'number',
                    hobbies: ['string'],
                    popularityScore: 'number'
                  },
                  position: {
                    x: 'number',
                    y: 'number'
                  },
                  type: 'HighScoreNode | LowScoreNode'
                }
              ],
              edges: [
                {
                  id: 'string',
                  source: 'string',
                  target: 'string',
                  type: 'string'
                }
              ]
            }
          }
        }
      },
      hobbies: {
        'GET /hobbies': {
          description: 'Get all unique hobbies',
          response: {
            success: true,
            data: ['string']
          }
        }
      },
      health: {
        'GET /health': {
          description: 'Health check endpoint',
          response: {
            success: true,
            message: 'Cybernauts API is running',
            timestamp: 'ISO string',
            version: '1.0.0'
          }
        }
      }
    },
    errorCodes: {
      400: 'Bad Request - Validation error',
      404: 'Not Found - Resource not found',
      409: 'Conflict - Business logic violation',
      500: 'Internal Server Error'
    },
    businessRules: {
      popularityScore: 'number of friends + (shared hobbies × 0.5)',
      deletionRule: 'User cannot be deleted while having friends',
      friendshipRule: 'Friendships are bidirectional and prevent duplicates',
      hobbyRule: 'Hobbies must be unique per user'
    }
  };

  res.json(apiDocs);
});

export default router;