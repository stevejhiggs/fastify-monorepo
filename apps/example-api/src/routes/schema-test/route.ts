/**
 * Zod schema validation for Fastify routes.
 * Shows validation for all request parts: body, querystring, params, headers, and responses.
 * Illustrates both inline schema definitions and separate schema objects, along with
 * various Zod features like coercion, optional fields, unions, arrays, and date validation.
 * The Zod schema provider enables both runtime validation and compile-time type checking.
 */
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import type { FastifySchema } from 'fastify';
import { z } from 'zod/v4';

const postSchema = {
  body: z.object({
    someKey: z.string().optional(),
    someOtherKey: z.number().max(999),
    arrayKey: z.array(z.number()).max(3),
    nullableKey: z.number().nullable(),
    multipleTypesKey: z.union([z.number(), z.boolean()])
  }),
  querystring: z.object({
    name: z.string(),
    excitement: z.coerce.number().int().optional()
  }),
  params: z.object({
    par1: z.string(),
    par2: z.coerce.number()
  }),
  headers: z.object({
    'x-foo': z.string()
  }),
  response: {
    200: z.object({
      par1: z.string(),
      par2: z.number(),
      queryName: z.string(),
      foo: z.string(),
      someOtherKey: z.number()
    })
  }
} satisfies FastifySchema;

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.post('/schema-test/post/:par1/:par2', { schema: postSchema }, async (request, reply) => {
    reply.send({
      par1: request.params.par1,
      par2: request.params.par2,
      queryName: request.query.name,
      foo: request.headers['x-foo'],
      someOtherKey: request.body.someOtherKey
    });
  });

  app.get(
    '/schema-test/get/:par1/:par2',
    {
      // you can also just pass the zod schema directly in here
      schema: {
        querystring: z.object({
          date: z.iso.date(),
          excitement: z.coerce.number().int().optional()
        }),
        params: z.object({
          par1: z.string(),
          par2: z.coerce.number()
        }),
        response: {
          200: z.object({
            par1: z.string(),
            par2: z.number(),
            queryDate: z.iso.date(),
            someOtherKey: z.number()
          })
        }
      }
    },
    async (request, reply) => {
      reply.send({
        par1: request.params.par1,
        par2: request.params.par2,
        queryDate: request.query.date,
        someOtherKey: 100
      });
    }
  );
}
