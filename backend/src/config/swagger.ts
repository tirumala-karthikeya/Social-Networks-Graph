import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cybernauts API',
      version: '1.0.0',
      description: 'Interactive User Relationship & Hobby Network API',
      contact: {
        name: 'Cybernauts Development Team',
        email: 'dev@cybernauts.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'age', 'hobbies'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            username: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User display name'
            },
            age: {
              type: 'integer',
              minimum: 13,
              maximum: 120,
              description: 'User age'
            },
            hobbies: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              description: 'List of user hobbies'
            },
            friends: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
              },
              description: 'List of friend user IDs'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            popularityScore: {
              type: 'number',
              minimum: 0,
              description: 'Calculated popularity score'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['username', 'age', 'hobbies'],
          properties: {
            username: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            age: {
              type: 'integer',
              minimum: 13,
              maximum: 120
            },
            hobbies: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1
            }
          }
        },
        UserUpdate: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            age: {
              type: 'integer',
              minimum: 13,
              maximum: 120
            },
            hobbies: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        RelationshipRequest: {
          type: 'object',
          required: ['friendId'],
          properties: {
            friendId: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user to create/remove friendship with'
            }
          }
        },
        GraphData: {
          type: 'object',
          properties: {
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  data: { type: 'object' },
                  position: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' }
                    }
                  },
                  type: { type: 'string' }
                }
              }
            },
            edges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  source: { type: 'string' },
                  target: { type: 'string' },
                  type: { type: 'string' }
                }
              }
            }
          }
        },
        UserStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalFriendships: { type: 'integer' },
            averagePopularityScore: { type: 'number' },
            topUsers: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Cybernauts API Documentation'
  }));
};

export default specs;