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
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sellerId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string', nullable: true },
            brand: { type: 'string', nullable: true },
            priceCents: { type: 'integer', minimum: 0 },
            stockQuantity: { type: 'integer', minimum: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'sellerId', 'name', 'category', 'priceCents', 'stockQuantity', 'createdAt', 'updatedAt']
        },
        ProductCreateRequest: {
          type: 'object',
          properties: {
            sellerId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' },
            brand: { type: 'string' },
            priceCents: { type: 'integer', minimum: 0 },
            stockQuantity: { type: 'integer', minimum: 0 }
          },
          required: ['name', 'category', 'priceCents', 'stockQuantity']
        },
        ProductUpdateRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string', nullable: true },
            brand: { type: 'string', nullable: true },
            priceCents: { type: 'integer', minimum: 0 },
            stockQuantity: { type: 'integer', minimum: 0 }
          }
        },
        PaginatedProducts: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1 },
            total: { type: 'integer', minimum: 0 }
          },
          required: ['items', 'page', 'limit', 'total']
        },
        CartUpsertRequest: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1 }
                },
                required: ['productId', 'quantity']
              },
              minItems: 1
            }
          },
          required: ['items']
        },
        CartItemWithProduct: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1 },
            product: { $ref: '#/components/schemas/Product' }
          },
          required: ['id', 'productId', 'quantity', 'product']
        },
        CartGetResponse: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItemWithProduct' } }
          },
          required: ['items']
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
      },
      '/product/all': {
        get: {
          summary: 'List all products (public catalogue)',
          tags: ['product'],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
            {
              name: 'sortBy',
              in: 'query',
              schema: { type: 'string', example: 'createdAt:desc' }
            },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'brand', in: 'query', schema: { type: 'string' } },
            { name: 'sellerId', in: 'query', schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedProducts' }
                }
              }
            }
          }
        }
      },
      '/product/seller': {
        get: {
          summary: 'List products for the authenticated seller (or any seller if ADMIN)',
          tags: ['product'],
          security: [{ accessTokenCookie: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'createdAt:desc' } },
            { name: 'sellerId', in: 'query', schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedProducts' }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a product for the authenticated seller (or for any seller if ADMIN)',
          tags: ['product'],
          security: [{ accessTokenCookie: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductCreateRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        }
      },
      '/product/seller/{productId}': {
        patch: {
          summary: 'Update a product (SELLER can update own; ADMIN can update any)',
          tags: ['product'],
          security: [{ accessTokenCookie: [] }],
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductUpdateRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a product (SELLER can delete own; ADMIN can delete any)',
          tags: ['product'],
          security: [{ accessTokenCookie: [] }],
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
      },
      '/cart': {
        get: {
          summary: 'Get the authenticated buyer cart',
          tags: ['cart'],
          security: [{ accessTokenCookie: [] }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CartGetResponse' }
                }
              }
            }
          }
        },
        post: {
          summary: 'Upsert cart items (quantity-based) for authenticated buyer',
          tags: ['cart'],
          security: [{ accessTokenCookie: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CartUpsertRequest' }
              }
            }
          },
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
    tags: [{ name: 'meta' }, { name: 'auth' }, { name: 'product' }, { name: 'cart' }]
  };
}
