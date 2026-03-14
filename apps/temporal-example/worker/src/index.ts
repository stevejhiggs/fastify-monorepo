import { initLogger } from '@repo/logging';
import { createTemporalLogger } from '@repo/temporal';
import { TASK_QUEUE } from '@repo/temporal-example-workflows';
import * as activities from '@repo/temporal-example-workflows/activities';
import { NativeConnection, Runtime, Worker } from '@temporalio/worker';

const logger = initLogger({ logLevel: process.env['LOG_LEVEL'] ?? 'info' });

Runtime.install({
  logger: createTemporalLogger(logger)
});

const TEMPORAL_ADDRESS = process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233';

async function run() {
  logger.info({ address: TEMPORAL_ADDRESS, taskQueue: TASK_QUEUE }, 'Connecting to Temporal server');

  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: TASK_QUEUE,
    workflowsPath: new URL('./workflows.ts', import.meta.url).pathname,
    activities
  });

  logger.info({ taskQueue: TASK_QUEUE }, 'Worker started, polling for tasks');

  const shutdown = async () => {
    logger.info('Shutting down worker');
    // eslint-disable-next-line @typescript-eslint/await-thenable -- shutdown() returns a Promise
    await worker.shutdown();
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  await worker.run();
  logger.info('Worker stopped');
}

run().catch((err: unknown) => {
  logger.error({ err }, 'Worker failed');
  process.exit(1);
});
