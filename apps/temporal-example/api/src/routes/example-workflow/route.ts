import { randomUUID } from 'node:crypto';

import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { exampleWorkflow, TASK_QUEUE } from '@repo/temporal-example-workflows';
import { z } from 'zod';

import { getTemporalClient } from '../../temporal-client.ts';

const requestBodySchema = z.object({
  input: z.string().min(1)
});

const responseSchema = z.object({
  workflowId: z.string(),
  result: z.string()
});

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.post('/example-workflow', {
    schema: {
      body: requestBodySchema,
      response: { 200: responseSchema }
    },
    handler: async (request, reply) => {
      const { input } = request.body;
      const workflowId = `example-${randomUUID()}`;

      const client = await getTemporalClient();

      const result = await client.workflow.execute(exampleWorkflow, {
        taskQueue: TASK_QUEUE,
        workflowId,
        args: [input]
      });

      reply.send({ workflowId, result });
    }
  });
}
