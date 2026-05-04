import type { OpenAPIV3 } from 'openapi-types';

import { config } from './config.js';

export function buildOpenApiSpec(): OpenAPIV3.Document {
  return {
    openapi: '3.0.0',
    info: {
      title: 'FlipMart API',
      version: '0.0.0'
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        accessTokenCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token'
        }
      },
      schemas: {
        AuthCredentials: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' }
          },
          required: ['email', 'password']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            userId: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['BUYER', 'SELLER', 'ADMIN'] }
          },
          required: ['userId', 'role']
        },
        OkResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' }
          },
          required: ['ok']
        }
      }
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['meta'],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' }
                    },
                    required: ['status']
                  }
                }
              }
            }
          }
        }
      }
      ,
      '/auth/register': {
        post: {
          summary: 'Register (creates BUYER) and sets auth cookies',
          tags: ['auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthCredentials' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'Login and sets auth cookies',
          tags: ['auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthCredentials' }
              }
            }
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            }
          }
        }
      },
      '/auth/refresh': {
        post: {
          summary: 'Rotate refresh token and return a new access token (cookies)',
          tags: ['auth'],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            }
          }
        }
      },
      '/auth/logout': {
        post: {
          summary: 'Logout from all devices (invalidate tokens) and clear cookies',
          tags: ['auth'],
          security: [{ accessTokenCookie: [] }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OkResponse' }
                }
              }
            }
          }
        }
      }
    },
    tags: [{ name: 'meta' }, { name: 'auth' }]
  };
}
