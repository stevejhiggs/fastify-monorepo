import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import z from 'zod';

// shows how to handle file uploads with the multipart plugin + zod validation
// unfortunatly this is a little faffy to make it work with swagger so we need to do
// a little preValidation to get the body into the request object
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
