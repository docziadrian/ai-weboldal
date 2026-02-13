
import { z } from 'zod';
import { insertMessageSchema, insertImageJobSchema, conversations, messages, imageJobs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  serviceUnavailable: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      responses: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          path: z.string()
        })),
      },
    },
  },
  chatterblast: {
    createConversation: {
      method: 'POST' as const,
      path: '/api/chatterblast/conversation' as const,
      input: z.object({}), // No body needed, just token header
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    sendMessage: {
      method: 'POST' as const,
      path: '/api/chatterblast/chat' as const,
      input: z.object({
        conversationId: z.number(),
        content: z.string().min(1),
      }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        503: errorSchemas.serviceUnavailable,
      },
    },
    getMessages: {
      method: 'GET' as const,
      path: '/api/chatterblast/conversation/:id/messages' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  dreamweaver: {
    generate: {
      method: 'POST' as const,
      path: '/api/dreamweaver/generate' as const,
      input: z.object({
        prompt: z.string().min(1),
      }),
      responses: {
        201: z.custom<typeof imageJobs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        503: errorSchemas.serviceUnavailable,
      },
    },
    getStatus: {
      method: 'GET' as const,
      path: '/api/dreamweaver/jobs/:id' as const,
      responses: {
        200: z.custom<typeof imageJobs.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  mindreader: {
    analyze: {
      method: 'POST' as const,
      path: '/api/mindreader/analyze' as const,
      // Input is FormData, handled loosely here but defined for frontend awareness
      responses: {
        200: z.object({
          objectCount: z.number(),
          objects: z.array(z.object({
            label: z.string(),
            score: z.number(),
            box: z.object({
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
            }),
          })),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        503: errorSchemas.serviceUnavailable,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
