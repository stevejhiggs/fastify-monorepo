import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.ts';

const { processInput, formatOutput } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3
  }
});

export async function exampleWorkflow(input: string): Promise<string> {
  const processed = await processInput(input);
  const formatted = await formatOutput(processed);
  return formatted;
}
