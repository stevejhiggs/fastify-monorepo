import { randomUUID } from 'node:crypto';

import { greetingWorkflow, GREETING_TASK_QUEUE } from '@example-temporal/workflows';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { z } from 'zod';

import { getTemporalClient } from '../../temporal-client.ts';

const greetingBodySchema = z.object({
  name: z.string().min(1),
  style: z.enum(['uppercase', 'lowercase']).default('uppercase')
});

const greetingResponseSchema = z.object({
  workflowId: z.string(),
  result: z.string()
});

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.post('/greeting', {
    schema: {
      body: greetingBodySchema,
      response: { 200: greetingResponseSchema }
    },
    handler: async (request, reply) => {
      const { name, style } = request.body;
      const workflowId = `greeting-${randomUUID()}`;

      const client = await getTemporalClient();

      const result = await client.workflow.execute(greetingWorkflow, {
        taskQueue: GREETING_TASK_QUEUE,
        workflowId,
        args: [name, style]
      });

      reply.send({ workflowId, result });
    }
  });
}
