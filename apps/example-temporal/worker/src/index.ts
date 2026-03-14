import { GREETING_TASK_QUEUE } from '@example-temporal/workflows';
import { initLogger } from '@repo/logging';
import { NativeConnection, Worker } from '@temporalio/worker';

import * as activities from '@example-temporal/workflows/activities';

const logger = initLogger({ logLevel: process.env['LOG_LEVEL'] ?? 'info' });

const TEMPORAL_ADDRESS = process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233';

async function run() {
  logger.info({ address: TEMPORAL_ADDRESS, taskQueue: GREETING_TASK_QUEUE }, 'Connecting to Temporal server');

  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: GREETING_TASK_QUEUE,
    workflowsPath: new URL('./workflows.ts', import.meta.url).pathname,
    activities
  });

  logger.info({ taskQueue: GREETING_TASK_QUEUE }, 'Worker started, polling for tasks');

  const shutdown = () => {
    logger.info('Shutting down worker');
    worker.shutdown();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await worker.run();
  logger.info('Worker stopped');
}

run().catch((err: unknown) => {
  logger.error({ err }, 'Worker failed');
  process.exit(1);
});
