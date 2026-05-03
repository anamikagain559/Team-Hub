export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Collaborative Team Hub API',
    version: '1.0.0',
    description: 'API documentation for the Collaborative Team Hub application.',
    contact: {
      name: 'API Support',
      email: 'support@teamhub.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login to the application',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Successful login' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/workspaces': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get all workspaces for the current user',
        responses: {
          200: { description: 'Success' },
        },
      },
      post: {
        tags: ['Workspaces'],
        summary: 'Create a new workspace',
        responses: {
          201: { description: 'Created' },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get tasks for a workspace',
        parameters: [
          {
            name: 'workspaceId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Success' },
        },
      },
    },
  },
};
