/**
 * File upload handling with multipart/form-data.
 * Shows how to use the multipart plugin with Zod validation for file uploads,
 * including MIME type restrictions and file size limits. Uses preValidation
 * to extract form data into the request body for Swagger compatibility.
 */
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import z from 'zod';
export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.post(
    '/files/upload',
    {
      preValidation: async (req) => {
        const formData = await req.formData();
        //@ts-expect-error ...
        req.body = Object.fromEntries(formData.entries());
      },
      schema: {
        consumes: ['multipart/form-data'],
        body: z.object({
          image: z
            .file()
            .mime(['image/png', 'image/jpeg'])
            .max(10 * 1024 * 1024)
        })
      }
    },
    async (req, reply) => {
      reply.send(`File received of type ${req.body.image.type}`);
    }
  );
}
